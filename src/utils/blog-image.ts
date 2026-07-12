export const getBlogImageSources = (source: string) => {
  const extensionIndex = source.lastIndexOf('.');
  const base = extensionIndex === -1 ? source : source.slice(0, extensionIndex);

  return {
    src: `${base}-1280.webp`,
    srcset: `${base}-640.webp 640w, ${base}-1280.webp 1280w`,
  };
};
