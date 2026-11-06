export function isSupportedImage(file: File) {
  const type = file.type.toLowerCase();
  if (['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp'].includes(type))
    return true;
  return (
    (type === '' || type === 'application/octet-stream') &&
    /\.(jpe?g|jfif|png|webp)$/i.test(file.name)
  );
}
