export type JsonData = Array<{
  [key: string]: any;
}>;

export type Base64Data = string;

export type ContentType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
  | 'application/pdf'
  | 'text/plain'
  | 'text/html'
  | 'text/css'
  | 'text/javascript'
  | 'application/json'
  | 'application/xml'
  | 'application/zip'
  | 'application/x-zip-compressed'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'video/mp4'
  | 'video/webm'
  | 'audio/mpeg'
  | 'audio/wav'
  | 'audio/ogg'
  | 'application/octet-stream';
