export const getPortFromUrl = (url: string | undefined): number => {
  if (!url) {
    return NaN;
  }

  const parsedUrl = new URL(url);
  return parseInt(parsedUrl.port, 10);
};
