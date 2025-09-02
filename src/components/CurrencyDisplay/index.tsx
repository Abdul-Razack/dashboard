import useCurrencySymbol from '@/hooks/useCurrencySymbol';

type CurrencyDisplayProps = {
  currencyId: string;
};

const CurrencyDisplay = ({ currencyId }: CurrencyDisplayProps) => {
  const symbol = useCurrencySymbol(currencyId);

  return symbol;
};

export default CurrencyDisplay;
