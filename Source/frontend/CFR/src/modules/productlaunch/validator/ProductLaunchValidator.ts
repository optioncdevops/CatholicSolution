export const validateLaunchProduct = (productId?: number): string[] => {
  const messages: string[] = [];
  if (!productId || productId <= 0) {
    messages.push('Product is required.');
  }
  return messages;
};
