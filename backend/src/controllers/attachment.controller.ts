import { Request, Response } from 'express';
import { Server } from 'socket.io';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs';
import { uploadToS3, deleteFromS3 } from '../services/s3.service';

const USE_S3 = process.env.USE_S3 === 'true';

// Upload attachment
export async function uploadAttachment(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: { board: { tenantId } },
      },
      include: {
        list: { select: { boardId: true } },
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    let fileUrl: string;
    let fileKey: string | null = null;

    if (USE_S3) {
      try {
        const { key, url } = await uploadToS3(req.file);
        fileUrl = url;
        fileKey = key;
        console.log('✅ File uploaded to S3:', url);
      } catch (s3Error) {
        console.error('❌ S3 upload error:', s3Error);
        // Fallback to local storage if S3 fails
        fileUrl = `/uploads/${req.file.filename}`;
        fileKey = req.file.filename;
        console.log('⚠️ Falling back to local storage');
      }
    } else {
      // Use local storage
      fileUrl = `/uploads/${req.file.filename}`;
      fileKey = req.file.filename;
      console.log('✅ File saved locally:', fileUrl);
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.originalname,
        url: fileUrl,
        fileKey: fileKey,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        cardId,
        userId,
      },
    });

    const io: Server = req.app.get('io');
    io.to(`card:${cardId}`).emit('attachmentAdded', { cardId, attachment });

    res.status(201).json({ attachment });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
}

// Get attachments for a card
export async function getCardAttachments(req: Request, res: Response) {
  try {
    const { cardId } = req.params;
    const tenantId = req.user?.tenantId;

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        list: { board: { tenantId } },
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const attachments = await prisma.attachment.findMany({
      where: { cardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ attachments });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
}

// Delete attachment
export async function deleteAttachment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    const attachment = await prisma.attachment.findFirst({
      where: {
        id,
        card: {
          list: { board: { tenantId } },
        },
      },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete file from storage
    if (USE_S3 && attachment.fileKey) {
      try {
        await deleteFromS3(attachment.fileKey);
        console.log('✅ File deleted from S3');
      } catch (s3Error) {
        console.error('⚠️ S3 delete error:', s3Error);
        // Continue anyway - delete from database
      }
    } else if (attachment.fileKey) {
      // Delete from local storage
      const filePath = path.join(__dirname, '../../uploads', attachment.fileKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('✅ File deleted from local storage');
      }
    }

    await prisma.attachment.delete({
      where: { id },
    });

    const io: Server = req.app.get('io');
    io.to(`card:${attachment.cardId}`).emit('attachmentDeleted', {
      cardId: attachment.cardId,
      attachmentId: id,
    });

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
}
