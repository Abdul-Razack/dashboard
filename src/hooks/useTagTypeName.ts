import { useTypeOfTagList } from '@/services/submaster/type-of-tag/services';

const useTagTypeName = (tagId: number) => {
  const tagList = useTypeOfTagList();
  const tagName = tagList.data?.items[tagId];

  if (tagList.isLoading) {
    return 'Loading...';
  }

  if (tagList.isError) {
    return 'Error';
  }

  return tagName;
};

export default useTagTypeName;
