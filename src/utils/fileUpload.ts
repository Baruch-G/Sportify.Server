import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get the project root directory (where package.json is located)
const PROJECT_ROOT = path.resolve(__dirname, '../..');
export const UPLOAD_DIR = path.join(PROJECT_ROOT, 'uploads/profile-images');
console.log('Project root:', PROJECT_ROOT);
console.log('Upload directory absolute path:', UPLOAD_DIR);
console.log('Current working directory:', process.cwd());
console.log('Alternative upload path:', path.join(process.cwd(), 'uploads/profile-images'));
console.log('Are paths equal?', PROJECT_ROOT === process.cwd());
console.log('Are upload dirs equal?', UPLOAD_DIR === path.join(process.cwd(), 'uploads/profile-images'));

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log('Creating upload directory at:', UPLOAD_DIR);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Verify directory exists and is writable
try {
  fs.accessSync(UPLOAD_DIR, fs.constants.W_OK);
  console.log('Upload directory is writable');
} catch (err) {
  console.error('Upload directory is not writable:', err);
  throw new Error('Upload directory is not writable');
}

export const saveImage = async (base64Image: string): Promise<string> => {
  let filename: string | undefined;
  try {
    console.log('Starting saveImage function');
    console.log('Base64 image length:', base64Image.length);
    
    if (!base64Image || typeof base64Image !== 'string') {
      throw new Error('Invalid image data: must be a non-empty string');
    }
    
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    console.log('Base64 data length after removing prefix:', base64Data.length);
    
    if (base64Data.length === 0) {
      throw new Error('Invalid image data: empty after removing prefix');
    }

    // Verify base64 data is valid
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      throw new Error('Invalid base64 data: contains invalid characters');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    console.log('Buffer size:', buffer.length);

    if (buffer.length === 0) {
      throw new Error('Invalid image data: empty buffer created');
    }

    // Generate unique filename
    filename = `${uuidv4()}.bin`;
    const filepath = path.join(UPLOAD_DIR, filename);
    console.log('Attempting to save file to:', filepath);
    console.log('Absolute filepath:', path.resolve(filepath));

    // Save file
    await fs.promises.writeFile(filepath, buffer);
    console.log('File write completed');
    
    // Verify file was actually created
    try {
      const stats = await fs.promises.stat(filepath);
      console.log('File saved successfully. Size:', stats.size, 'bytes');
      console.log('File exists at:', filepath);
      console.log('File is readable:', fs.accessSync(filepath, fs.constants.R_OK) === undefined);
      
      if (stats.size === 0) {
        throw new Error('File was created but is empty');
      }
    } catch (err) {
      console.error('Error verifying saved file:', err);
      throw new Error('File was not saved properly');
    }

    // Return the relative path that can be used in URLs
    const urlPath = `/uploads/profile-images/${filename}`;
    console.log('Returning URL path:', urlPath);
    return urlPath;
  } catch (error) {
    console.error('Error in saveImage:', error);
    // Try to clean up if file was partially created
    if (error instanceof Error && error.message.includes('File was not saved properly') && filename) {
      try {
        const filepath = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(filepath)) {
          await fs.promises.unlink(filepath);
          console.log('Cleaned up partially saved file');
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    }
    throw error;
  }
};

export const deleteImage = async (imagePath: string): Promise<void> => {
  try {
    if (!imagePath) return;

    // Convert URL path to filesystem path
    const filename = path.basename(imagePath);
    const filepath = path.join(UPLOAD_DIR, filename);

    // Check if file exists before deleting
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}; 