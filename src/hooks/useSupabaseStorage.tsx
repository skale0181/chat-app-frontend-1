import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const useSupabaseStorage = () => {
  const { supabase } = useAuth();
  const [uploading, setUploading] = useState(false);
  
  const uploadFile = async (file: File, contentType: string) => {
    try {
      setUploading(true);
      
      // Generate file path based on content type and unique ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${contentType}s/${fileName}`;
      
      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);
      
      return { url: data.publicUrl, fileName: file.name, error: null };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return { url: null, fileName: null, error };
    } finally {
      setUploading(false);
    }
  };
  
  return { uploadFile, uploading };
};