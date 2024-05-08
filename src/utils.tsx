

export const commify = (number, decimals = undefined) => {
  if (number === undefined) return "";
  let numStr = number.toString();
  let [integerPart, decimalPart] = numStr.split(".");

  // Apply thousand separators to the integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Process the decimal part based on the 'decimals' parameter
  if (decimalPart && decimals !== undefined) {
      decimalPart = decimalPart.slice(0, decimals);
  }

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}
