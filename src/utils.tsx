export const commify = (number, decimals = undefined) => {
  if (number === undefined) return "";
  
  let numStr = number.toString();
  let [integerPart, decimalPart] = numStr.split(".");

  // Apply thousand separators to the integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Process the decimal part based on the 'decimals' parameter
  if (decimalPart && decimals !== undefined) {
      decimalPart = decimalPart.slice(0, decimals);
      // Ensure the decimal part fills out to the specified precision
      while (decimalPart.length < decimals) {
          decimalPart += '0'; // Pad with zeros if not enough digits after slicing
      }
  } else if (decimals !== undefined && decimals > 0) {
      decimalPart = "".padEnd(decimals, '0'); // Pad if no decimal part exists
  }

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}
