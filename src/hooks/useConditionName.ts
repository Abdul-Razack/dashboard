import { useConditionList } from '@/services/submaster/conditions/services';

const useConditionName = (conditionId: number) => {
  const conditionList = useConditionList();
  const conditionName = conditionList.data?.items[conditionId];

  if (conditionList.isLoading) {
    return 'Loading...';
  }

  if (conditionList.isError) {
    return 'Error';
  }

  return conditionName;
};

export default useConditionName;
