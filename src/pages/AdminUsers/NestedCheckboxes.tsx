// import { useState, useEffect } from "react";
// import { Button, HStack, Stack } from "@chakra-ui/react";
// import { useCreateAssignMenus } from "@/services/menu/services";
// import { useToastError, useToastSuccess } from "@/components/Toast";

// const NestedCheckboxes = ({ data, user_id, menu_ids }: { data: any[], user_id: number, menu_ids: number[] }) => {
//   const toastSuccess = useToastSuccess();
//   const toastError = useToastError();

//   // State for checkbox selections
//   const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

//   // Initialize checked items based on `menu_ids`
//   useEffect(() => {
//     const initialCheckedState: { [key: number]: boolean } = {};

//     data.forEach((item) => {
//       initialCheckedState[item.id] = menu_ids.includes(item.id);
//       item.submenu.forEach((sub: any) => {
//         initialCheckedState[sub.id] = menu_ids.includes(sub.id);
//       });
//     });

//     setCheckedItems(initialCheckedState);
//   }, [menu_ids, data]);

//   // Handle "Select All" toggle
//   const handleSelectAll = () => {
//     const allChecked = Object.values(checkedItems).every(Boolean);
//     const updated: { [key: number]: boolean } = {};

//     data.forEach((item) => {
//       updated[item.id] = !allChecked;
//       item.submenu.forEach((sub: any) => {
//         updated[sub.id] = !allChecked;
//       });
//     });

//     setCheckedItems(updated);
//   };

//   // Handle Parent Checkbox Change
//   const handleParentChange = (id: number, submenu: any[]) => {
//     const isChecked = !checkedItems[id];
//     setCheckedItems((prev) => {
//       const updated = { ...prev, [id]: isChecked };
//       submenu.forEach((sub) => {
//         updated[sub.id] = isChecked;
//       });
//       return updated;
//     });
//   };

//   // Handle Child Checkbox Change
//   const handleChildChange = (id: number, parentId: number) => {
//     setCheckedItems((prev) => {
//       const updated = { ...prev, [id]: !prev[id] };

//       // Check if any child remains checked; if none, uncheck the parent
//       const parentItem = data.find((item) => item.id === parentId);
//       if (parentItem) {
//         const anyChildChecked = parentItem.submenu.some((sub: any) => updated[sub.id]);
//         updated[parentId] = anyChildChecked;
//       }

//       return updated;
//     });
//   };

//   // Handle Save Button Click
//   const handleSave = () => {
//     const selectedMenuIds = Object.keys(checkedItems)
//       .filter((key) => checkedItems[Number(key)])
//       .map(Number);

//     const payload = {
//       user_id,
//       menu_ids: selectedMenuIds,
//     };

//     createAssignMenus.mutate(payload);
//   };

//   const createAssignMenus = useCreateAssignMenus({
//     onSuccess: () => {
//       toastSuccess({ title: "Menu assign Created" });
//     },
//     onError: (error) => {
//       toastError({
//         title: "Menu assign Creation Failed",
//         description: error.response?.data.message || "Unknown Error",
//       });
//     },
//   });

//   return (
//     <Stack spacing={4}>
//       <h1>ACL User Access</h1>
//       <Stack mt={".5rem"}>
//         <label>
//           <input
//             type="checkbox"
//             checked={Object.values(checkedItems).length > 0 && Object.values(checkedItems).every(Boolean)}
//             onChange={handleSelectAll}
//             style={{ marginRight: "10px" }}
//           />
//           {Object.values(checkedItems).length > 0 && Object.values(checkedItems).every(Boolean) ? "Unselect All" : "Select All"}
//         </label>
//         <ul style={{ listStyleType: "none", paddingLeft: "10px" }}>
//           {data.map((item) => (
//             <li key={item.id} style={{ marginBottom: "10px" }}>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={checkedItems[item.id] || false}
//                   onChange={() => handleParentChange(item.id, item.submenu)}
//                   style={{ marginRight: "10px" }}
//                 />
//                 {item.name}
//               </label>
//               {item.submenu.length > 0 && (
//                 <ul style={{ paddingLeft: "20px" }}>
//                   {item.submenu.map((subItem: any) => (
//                     <li key={subItem.id} style={{ marginBottom: "5px" }}>
//                       <label>
//                         <input
//                           type="checkbox"
//                           checked={checkedItems[subItem.id] || false}
//                           onChange={() => handleChildChange(subItem.id, item.id)}
//                           style={{ marginRight: "10px" }}
//                         />
//                         {subItem.name}
//                       </label>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </li>
//           ))}
//         </ul>
//       </Stack>
//       <HStack justifyContent={"center"} mt={2}>
//         <HStack spacing={2} align="center" marginTop={"1rem"}>
//           <Button colorScheme="brand" type="button" onClick={handleSave} isDisabled={Object.values(checkedItems).every(value => !value)}>
//             Save
//           </Button>
//         </HStack>
//       </HStack>
//     </Stack>
//   );
// };

// export default NestedCheckboxes;

import { useState, useEffect } from "react";
import { Button, HStack, Stack } from "@chakra-ui/react";
import { useCreateAssignMenus } from "@/services/menu/services";
import { useToastError, useToastSuccess } from "@/components/Toast";

const NestedCheckboxes = ({ data, user_id, menu_ids }: { data: any[], user_id: number, menu_ids: number[] }) => {
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  // State for checkbox selections
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  // Initialize checked items based on `menu_ids`
  useEffect(() => {
    const initialCheckedState: { [key: number]: boolean } = { 1: true }; // Dashboard always checked

    data.forEach((item) => {
      if (item.id !== 1) { // Ensure Dashboard remains checked
        initialCheckedState[item.id] = menu_ids.includes(item.id);
      }
      item.submenu.forEach((sub: any) => {
        initialCheckedState[sub.id] = menu_ids.includes(sub.id);
      });
    });

    setCheckedItems(initialCheckedState);
  }, [menu_ids, data]);

  // Handle "Select All" toggle (Dashboard remains checked)
  const handleSelectAll = () => {
    const allChecked = Object.values(checkedItems).every(Boolean);
    const updated: { [key: number]: boolean } = { 1: true }; // Dashboard always checked

    data.forEach((item) => {
      if (item.id !== 1) { // Skip Dashboard
        updated[item.id] = !allChecked;
        item.submenu.forEach((sub: any) => {
          updated[sub.id] = !allChecked;
        });
      }
    });

    setCheckedItems(updated);
  };

  // Handle Parent Checkbox Change (Dashboard cannot be unchecked)
  const handleParentChange = (id: number, submenu: any[]) => {
    if (id === 1) return; // Prevent Dashboard from being unchecked

    const isChecked = !checkedItems[id];
    setCheckedItems((prev) => {
      const updated = { ...prev, [id]: isChecked };
      submenu.forEach((sub) => {
        updated[sub.id] = isChecked;
      });
      return updated;
    });
  };

  // Handle Child Checkbox Change
  const handleChildChange = (id: number, parentId: number) => {
    setCheckedItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };

      // Check if any child remains checked; if none, uncheck the parent
      const parentItem = data.find((item) => item.id === parentId);
      if (parentItem) {
        const anyChildChecked = parentItem.submenu.some((sub: any) => updated[sub.id]);
        updated[parentId] = anyChildChecked;
      }

      return updated;
    });
  };

  // Handle Save Button Click
  const handleSave = () => {
    const selectedMenuIds = Object.keys(checkedItems)
      .filter((key) => checkedItems[Number(key)])
      .map(Number);

    const payload = {
      user_id,
      menu_ids: selectedMenuIds,
    };

    createAssignMenus.mutate(payload);
  };

  const createAssignMenus = useCreateAssignMenus({
    onSuccess: () => {
      toastSuccess({ title: "Menu assign Created" });
    },
    onError: (error) => {
      toastError({
        title: "Menu assign Creation Failed",
        description: error.response?.data.message || "Unknown Error",
      });
    },
  });

  return (
    <Stack spacing={4}>
      <h1>ACL User Access</h1>
      <Stack mt={".5rem"}>
        <label>
          <input
            type="checkbox"
            checked={Object.values(checkedItems).length > 0 && Object.values(checkedItems).every(Boolean)}
            onChange={handleSelectAll}
            style={{ marginRight: "10px" }}
          />
          {Object.values(checkedItems).length > 0 && Object.values(checkedItems).every(Boolean) ? "Unselect All" : "Select All"}
        </label>
        <ul style={{ listStyleType: "none", paddingLeft: "10px" }}>
          {data.map((item) => (
            <li key={item.id} style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={checkedItems[item.id] || false}
                  onChange={() => handleParentChange(item.id, item.submenu)}
                  disabled={item.id === 1} // Dashboard is disabled
                  style={{ marginRight: "10px" }}
                />
                {item.name}
              </label>
              {item.submenu.length > 0 && (
                <ul style={{ paddingLeft: "20px" }}>
                  {item.submenu.map((subItem: any) => (
                    <li key={subItem.id} style={{ marginBottom: "5px" }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checkedItems[subItem.id] || false}
                          onChange={() => handleChildChange(subItem.id, item.id)}
                          style={{ marginRight: "10px" }}
                        />
                        {subItem.name}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Stack>
      <HStack justifyContent={"center"} mt={2}>
        <HStack spacing={2} align="center" marginTop={"1rem"}>
          <Button colorScheme="brand" type="button" onClick={handleSave} isDisabled={Object.values(checkedItems).every(value => !value)}>
            Save
          </Button>
        </HStack>
      </HStack>
    </Stack>
  );
};

export default NestedCheckboxes;
