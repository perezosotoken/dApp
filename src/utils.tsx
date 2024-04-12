

export const commify = (number) => {
    let numStr = number.toString();
    let [integerPart, decimalPart] = numStr.split(".");
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  }
  