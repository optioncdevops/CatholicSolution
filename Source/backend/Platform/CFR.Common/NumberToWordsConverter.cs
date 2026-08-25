// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common;

public class NumberToWordsConverter
{
    public static string ConvertNumberToWords(decimal number)
    {
        if (number == 0)
        {
            return "Zero Only";
        }

        long intPart = (long)Math.Floor(number);
        int decimalPart = (int)((number - intPart) * 100);

        string words = ConvertToWords(intPart);

        if (decimalPart > 0)
        {
            words += " and " + ConvertToWords(decimalPart) + " Paise";
        }

        return words.Trim() + " Only";
    }

    private static string ConvertToWords(long number)
    {
        string[] units =
        [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
            "Eighteen", "Nineteen"
        ];

        string[] tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        if (number == 0)
        {
            return "";
        }

        if (number < 20)
        {
            return units[number];
        }

        if (number < 100)
        {
            return tens[number / 10] + (number % 10 > 0 ? " " + units[number % 10] : "");
        }

        if (number < 1000)
        {
            return units[number / 100] + " Hundred" + (number % 100 > 0 ? " " + ConvertToWords(number % 100) : "");
        }

        if (number < 100000)
        {
            return ConvertToWords(number / 1000) + " Thousand" + (number % 1000 > 0 ? " " + ConvertToWords(number % 1000) : "");
        }

        if (number < 10000000)
        {
            return ConvertToWords(number / 100000) + " Lakh" + (number % 100000 > 0 ? " " + ConvertToWords(number % 100000) : "");
        }

        return ConvertToWords(number / 10000000) + " Crore" + (number % 10000000 > 0 ? " " + ConvertToWords(number % 10000000) : "");
    }
}
