import { useEffect, useState } from 'react';

import { useCurrencyList } from '@/services/submaster/currency/services';

function useCurrencyName(currencyId: number): [string] {
  const [currencyName, setCurrencyName] = useState('');
  const currencyList = useCurrencyList();

  const currencyDetails = currencyList.data?.items[currencyId];

  useEffect(() => {
    if (currencyList.isLoading) {
      return setCurrencyName('Loading...');
    }

    setCurrencyName(currencyDetails ?? 'Name not available');
  }, [currencyDetails]);

  return [currencyName];
}

export default useCurrencyName;
