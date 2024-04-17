

export const commify = (number) => {
  if (number === undefined) return "";
    let numStr = number.toString();
    let [integerPart, decimalPart] = numStr.split(".");
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  }
  