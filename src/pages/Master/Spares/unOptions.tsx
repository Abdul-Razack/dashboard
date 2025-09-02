import React, { useState, useMemo, useEffect } from 'react';
import { useUnIndex } from '@/services/submaster/un/services';
import { FieldSelect } from '@/components/FieldSelect';
import FieldDisplay from '@/components/FieldDisplay';

interface UnOptionsProps {
    un_id: number | null | string | undefined;
    is_llp: boolean | undefined;
}

const UnOptions: React.FC<UnOptionsProps> = ({ un_id, is_llp }) => {
    const [spareLoading, setSpareSearchLoading] = useState<boolean>(false);
    const [selectedUnId, setSelectedUnId] = useState<number | null | string | undefined>(un_id ?? null);
    const [selectedUn, setSelectedUn] = useState<any>(null);
    const [resetKey, setResetKey] = useState(0); 
    const [initialLoadDone, setInitialLoadDone] = useState<Boolean>(false); 
    const unDetails = useUnIndex();

    // Convert UN details into a Map for **O(1) fast lookup**
    const unMap = useMemo(() => {
        return new Map(unDetails?.data?.items?.map((un: any) => [un.id, un]));
    }, [unDetails]);

    const unOptions = useMemo(() => {
        return [
            { value: null, label: 'Select UN' },
            ...unDetails?.data?.items?.map((un: any) => ({
                value: un.id.toString(),
                label: un.name +' - '+ un.description,
            })) || [],
        ];
    }, [unDetails]);

    useEffect(() => {
        if (selectedUnId !== null && selectedUnId !== 0) {
            setSelectedUn(unMap.get(selectedUnId) || null);
        }
    }, [selectedUnId, unMap]);

    useEffect(() => {
       if(!is_llp && initialLoadDone){
        setSelectedUn(null);
        setSelectedUnId(null);
        setResetKey((prevKey) => prevKey + 1);
       }
    }, [is_llp, initialLoadDone]);

    useEffect(() => {
        setSelectedUn(un_id);
     }, [un_id]);

     useEffect(() => {
        setInitialLoadDone(true);
     }, []);

    return (
        <React.Fragment>
            <FieldSelect
                isDisabled={!is_llp}
                key={`un_number_${resetKey}`}
                name="un_id"
                label="UN"
                menuPortalTarget={document.body}
                required={is_llp ? 'UN is required' : ''}
                defaultValue={selectedUnId ? selectedUnId.toString() : ''}
                options={unOptions}
                isClearable
                onValueChange={(value) => {
                    const newId = value ? Number(value) : null; // Handle null gracefully
                    setSelectedUnId(newId);
                    setSelectedUn(unMap.get(newId) || null); // Update immediately
                }}
                selectProps={{
                    noOptionsMessage: () => 'No UN found',
                    isLoading: spareLoading,
                    styles: {
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      },
                    onInputChange: (event: any) => {
                        setSpareSearchLoading(true);
                        setTimeout(() => {
                            setSelectedUnId(event ? Number(event) : null);
                            setSpareSearchLoading(false);
                        }, 500);
                    },
                }}
                className={!is_llp ? 'disabled-input': ''}
            />

            <FieldDisplay label="Class" value={selectedUn?.classs ?? 'N/A'} key={`class_${selectedUnId}`} />
            {/* <FieldDisplay label="Description" value={selectedUn?.description ?? 'N/A'} key={`description_${selectedUnId}`} /> */}
        </React.Fragment>
    );
};

export default UnOptions;
