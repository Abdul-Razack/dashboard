import { FC, useEffect, useRef, useState } from 'react';

import {
  Avatar,
  Box,
  BoxProps,
  Link as ChakraLink,
  CloseButton,
  Collapse,
  Drawer,
  DrawerContent,
  Flex,
  FlexProps,
  HStack,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import Axios from 'axios';
import { IconType } from 'react-icons';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaCog,
  FaFileAlt,
  FaGlobeAmericas,
  FaHome,
  FaMapMarker,
  FaShoppingBag,
  FaUserFriends,
  FaMoneyBill,
  FaReceipt
} from 'react-icons/fa';
import { HiOutlineUserGroup } from "react-icons/hi";
import {
  FaAddressBook,
  FaArrowRightToCity,
  FaBabyCarriage,
  FaBox,
  FaBoxOpen,
  FaBriefcase,
  FaBuildingColumns,
  FaBuildingUser,
  FaChartSimple,
  FaClipboardCheck,
  FaCodeCompare,
  FaCodePullRequest,
  FaCreditCard,
  FaDollarSign,
  FaFileCircleCheck,
  FaFileCircleXmark,
  FaFileInvoice,
  FaFileSignature,
  FaFlag,
  FaGraduationCap,
  FaI,
  FaLayerGroup,
  FaPlane,
  FaQuora,
  FaRankingStar,
  FaRecordVinyl,
  FaSailboat,
  FaShip,
  FaSith,
  FaTableList,
  FaTruck,
  FaUser,
  FaUserCheck,
  FaUserPlus,
  FaUserShield,
  FaUsersGear,
  FaWarehouse,
  FaWrench,
  FaRegCreditCard,
  FaLocationDot,
  FaUserGroup
} from 'react-icons/fa6';
import { FiBell, FiChevronDown, FiMenu } from 'react-icons/fi';
import { PiWrench } from 'react-icons/pi';
import { useQueryClient } from 'react-query';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LuMail } from "react-icons/lu";
import { PasswordUpdateModal } from '@/components/Popups/PasswordUpdate';
import { ProfileUpdateModal } from '@/components/Popups/ProfileUpdate';
import { ProfilePayload } from '@/services/adminuser/schema';
import { getAPICall } from '@/services/apiService';
import { useAuthContext } from '@/services/auth/AuthContext';
import { useUserContext } from '@/services/auth/UserContext';
import { useProfileInfo } from '@/services/profile/services';
import LoadingOverlay from '@/components/LoadingOverlay';

interface LinkItemProps {
  name: string;
  icon: IconType;
  link?: string;
  subItems?: LinkItemProps[];
}

// interface SectionProps {
//   sectionName: string;
//   items: LinkItemProps[];
// }

interface MobileProps extends FlexProps {
  onOpen: () => void;
  userInfo?: any;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}


// const NavigationSections: Array<SectionProps> = [
//   {
//     sectionName: 'Dashboard',
//     items: [{ name: 'Dashboard', icon: FaHome, link: '/' }],
//   },
//   {
//     sectionName: '',
//     items: [
//       {
//         name: 'User Access',
//         icon: FaUsersGear,
//         subItems: [
//           { name: 'Admin Users', icon: FaUserPlus, link: '/admin-users' },
//           {
//             name: 'User Roles',
//             icon: FaBuildingUser,
//             link: '/user-roles',
//           },
//           {
//             name: 'Departments',
//             icon: FaTableList,
//             link: '/departments',
//           },
//           { name: 'Email Alert', icon: LuMail, link: '/email-alert/master' },
//           { name: 'Menu', icon: FiMenu, link: '/menu' }
//         ],
//       },
//     ],
//   },
//   {
//     sectionName: "Master Menu",
//     items: [
//       {
//         name: 'Contact Management',
//         icon: FaGraduationCap,
//         subItems: [
//           {
//             name: 'Contact Management',
//             icon: FaUser,
//             link: '/customer-master',
//           },
//           {
//             name: 'Customer Bank Master',
//             icon: FaBuildingColumns,
//             link: '/bank-master',
//           },
//           {
//             name: 'Principal of Owner',
//             icon: FaUserCheck,
//             link: '/principle-of-owner-master',
//           },
//           {
//             name: 'Contact Manager',
//             icon: FaAddressBook,
//             link: '/contact-manager-master',
//           },
//           {
//             name: 'Trader Reference',
//             icon: FaClipboardList,
//             link: '/trader-reference-master',
//           },
//           {
//             name: 'Shipping Address',
//             icon: FaTruck,
//             link: '/shipping-address-master',
//           },
//         ],
//       },
//       {
//         name: 'Submaster',
//         icon: FaUserShield,
//         subItems: [
//           {
//             name: 'Contact Group',
//             icon: HiOutlineUserGroup,
//             link: '/submaster/customer-group',
//           },
//           {
//             name: 'Business Type',
//             icon: FaBriefcase,
//             link: '/submaster/business-type',
//           },
//           {
//             name: 'Contact Type',
//             icon: FaUserFriends,
//             link: '/submaster/contact-type',
//           },
//           {
//             name: 'Currency',
//             icon: FaDollarSign,
//             link: '/submaster/currencies',
//           },
//           {
//             name: 'Payment Mode',
//             icon: FaCreditCard,
//             link: '/submaster/payment-mode',
//           },
//           {
//             name: 'Payment Terms',
//             icon: FaCalendarAlt,
//             link: '/submaster/payment-terms',
//           },
//           {
//             name: 'Spare Class',
//             icon: FaCog,
//             link: '/submaster/spare-class',
//           },
//           {
//             name: 'Spare Type',
//             icon: FaBox,
//             link: '/submaster/spare-type',
//           },
//           {
//             name: 'Spare Model',
//             icon: FaWrench,
//             link: '/submaster/spare-model',
//           },
//           {
//             name: 'Priorities',
//             icon: FaFlag,
//             link: '/submaster/priorities',
//           },
//           {
//             name: 'Conditions',
//             icon: FaCheckCircle,
//             link: '/submaster/conditions',
//           },
//           {
//             name: 'FOB',
//             icon: FaWarehouse,
//             link: '/submaster/fob',
//           },
//           {
//             name: 'Ship Accounts',
//             icon: FaShip,
//             link: '/submaster/ship-accounts',
//           },
//           {
//             name: 'Ship Modes',
//             icon: FaTruck,
//             link: '/submaster/ship-modes',
//           },
//           {
//             name: 'Ship Via',
//             icon: FaPlane,
//             link: '/submaster/ship-via',
//           },
//           {
//             name: 'Custom Entry',
//             icon: FaGlobeAmericas,
//             link: '/submaster/custom-entry',
//           },
//           {
//             name: 'Package Type',
//             icon: FaBox,
//             link: '/submaster/package-type',
//           },
//           {
//             name: 'Ship Type',
//             icon: FaSailboat,
//             link: '/submaster/ship-type',
//           },
//           {
//             name: 'Warehouse',
//             icon: FaWarehouse,
//             link: '/submaster/warehouse',
//           },
//           {
//             name: 'Rack',
//             icon: FaLayerGroup,
//             link: '/submaster/rack',
//           },
//           {
//             name: 'Bin Location',
//             icon: FaBoxOpen,
//             link: '/submaster/bin-location',
//           },
//         ],
//       },
//     ],
//   },
//   {
//     sectionName: 'Other Menus',
//     items: [
//       { name: 'Spares', icon: PiWrench, link: '/spares-master' },
//       // { name: 'Sales', icon: SlTag },
//       {
//         name: 'Sales',
//         icon: FaChartSimple,
//         subItems: [
//           {
//             name: 'SEL',
//             icon: FaRankingStar,
//             link: '#',
//           },
//           {
//             name: 'Quotation',
//             icon: FaQuora,
//             link: '#',
//           },
//           {
//             name: 'Order',
//             icon: FaBabyCarriage,
//             link: '#',
//           },
//           {
//             name: 'GRA',
//             icon: FaRecordVinyl,
//             link: '#',
//           },
//         ],
//       },
//       {
//         name: 'Purchase',
//         icon: FaShoppingBag,
//         subItems: [
//           {
//             name: 'Material Request',
//             icon: FaClipboardCheck,
//             link: '/purchase/purchase-request',
//           },
//           {
//             name: 'PRFQ',
//             icon: FaCodeCompare,
//             link: '/purchase/prfq',
//           },
//           {
//             name: 'Supplier Pricing Update',
//             icon: FaFileSignature,
//             link: '/purchase/quotation',
//           },
//           {
//             name: 'Purchase Order',
//             icon: FaFileInvoice,
//             link: '/purchase/purchase-order',
//           }
//         ],
//       },
//       {
//         name: 'Finance',
//         icon: FaMoneyBill,
//         subItems: [
//           {
//             name: 'Proforma Invoice',
//             icon: FaRegCreditCard,
//             link: '/finance/proforma-invoice',
//           },
//           {
//             name: 'Receipt Entry',
//             icon: FaRegCreditCard,
//             link: '/payment/receipt-entry',
//           }
//         ],
//       },
//       {
//         name: 'Inward',
//         icon: FaSith,
//         subItems: [
//           {
//             name: 'Inspection',
//             icon: FaI,
//             link: '/inspection/dashboard',
//           },
//           {
//             name: 'GRN',
//             icon: FaClipboardCheck,
//             link: '/inward/grn',
//           },
//           {
//             name: 'QC Approval',
//             icon: FaFileCircleCheck,
//             link: '/qc/approval',
//           },
//           {
//             name: 'Quarantine Approval',
//             icon: FaFileCircleXmark,
//             link: '/quarantine/approval',
//           },{
//             name: 'Location Update',
//             icon: FaLocationDot,
//             link: 'inward/grn/location/update',
//           },
          
//         ],
//       },
//       {
//         name: 'Logistics',
//         icon: FaTruck,
//         subItems: [
//           {
//             name: 'STF',
//             icon: FaMapMarker,
//             link: '/purchase/stf',
//           },
//           {
//             name: 'Receive',
//             icon: FaCheckCircle,
//             link: '/logistics/receive',
//           },
//           {
//             name: 'Request',
//             icon: FaCodePullRequest,
//             link: '/logistics/request',
//           },
//           {
//             name: 'RFQ',
//             icon: FaArrowRightToCity,
//             link: '/logistics/lrfq',
//           },
//           {
//             name: 'Quotation',
//             icon: FaFileAlt,
//             link: '/logistics/quotation/master',
//           },
//           {
//             name: 'Order',
//             icon: FaBabyCarriage,
//             link: '/logistics/order/master',
//           },
//           {
//             name: 'Commercial Invoice',
//             icon: FaFileInvoice,
//             link: '#',
//           },
//           // {
//           //   name: 'Shipment',
//           //   icon: FaShip,
//           //   link: '/logistics/shipment',
//           // },
//           // {
//           //   name: 'Track',
//           //   icon: FaMapMarker,
//           //   link: '/logistics/track',
//           // },
//         ],
//       },
//       // { name: 'Inventory', icon: HiOutlineCube },
//       // { name: 'Shipment Track', icon: LiaSearchLocationSolid },
//       // { name: 'Store', icon: BiStoreAlt },
//       // { name: 'Account', icon: HiOutlineUserCircle },
//       // { name: 'Reports', icon: HiOutlineDocumentReport },
//       // { name: 'QC', icon: MdOutlineContactSupport },
//     ],
//   },
// ];

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType> = {
    FaHome,
    FaUsersGear,
    FaGraduationCap,
    FaUserShield,
    PiWrench,
    FaUserPlus,
    FaBuildingUser,
    FaShoppingBag,
    FaChartSimple,
    FaSith,
    FaMoneyBill,
    FaTableList,
    LuMail,
    FiMenu,
    FaUser,
    FaBuildingColumns,
    FaAddressBook,
    FaClipboardList,
    HiOutlineUserGroup,
    FaBriefcase,
    FaUserFriends,
    FaDollarSign,
    FaCreditCard,
    FaCalendarAlt,
    FaCog,
    FaWrench,
    FaFlag,
    FaCheckCircle,
    FaShip,
    FaTruck,
    FaPlane,
    FaGlobeAmericas,
    FaBox,
    FaSailboat,
    FaWarehouse,
    FaLayerGroup,
    FaBoxOpen,
    FaRankingStar,
    FaQuora,
    FaBabyCarriage,
    FaRecordVinyl,
    FaClipboardCheck,
    FaCodeCompare,
    FaFileSignature,
    FaFileInvoice,
    FaRegCreditCard,
    FaI,
    FaFileCircleCheck,
    FaFileCircleXmark,
    FaLocationDot,
    FaMapMarker,
    FaCodePullRequest,
    FaArrowRightToCity,
    FaFileAlt,
    FaUserCheck,
    FaUserGroup,
    FaReceipt 
  };

  return icons[iconName as keyof typeof icons] || '';
};

const mapMenuToNavigationSections = (menu: any) => {
  const masterMenuKeywords = ["Contact Management", "Submaster"];
  const userAccessKeywords = ["Dashboard", "User Access"];
  return menu.reduce((acc: any[], item: any) => {
    if (userAccessKeywords.includes(item.name)) {
      acc.push({
        sectionName: "",
        items: [
          {
            name: item.name,
            icon: getIcon(item.icon), // Now returns a component reference
            link: item.link,
            subItems: item.submenu.map((subItem: any) => ({
              name: subItem.name,
              icon: getIcon(subItem.icon), // Fix applied here
              link: subItem.link,
            })),
          },
        ],
      });
      return acc;
    }

    const sectionName = masterMenuKeywords.includes(item.name)
      ? "Master Menu"
      : "Other Menus";

    let section = acc.find((sec) => sec.sectionName === sectionName);
    if (!section) {
      section = { sectionName, items: [] };
      acc.push(section);
    }

    section.items.push({
      name: item.name,
      icon: getIcon(item.icon), // Now correctly returning a component
      link: item.link,
      subItems: item.submenu.map((subItem: any) => ({
        name: subItem.name,
        icon: getIcon(subItem.icon),
        link: subItem.link,
      })),
    });

    return acc;
  }, []);
};

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  
  const { data, isLoading } = useProfileInfo();
  const userInfo = data?.data?.menu || [];
  
  const NavigationSections = mapMenuToNavigationSections(userInfo);
  return (
    <Box
      transition="3s ease"
      bg={'#0C2556'}
      borderRight="1px"
      borderRightColor={'gray.200'}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      maxHeight="100vh"
      overflowY={'auto'}
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray',
          borderRadius: '24px',
        },
      }}
      {...rest}
    >
      <Flex h="28" alignItems="center" mx="8" justifyContent="space-between">
        <Image src="/logo.png" alt="logo" height={'20'} width={'auto'} />
        <CloseButton
          display={{ base: 'flex', md: 'none' }}
          color={'white'}
          onClick={onClose}
        />
      </Flex>
        <LoadingOverlay isLoading={isLoading} marginTop={isLoading ? '10rem' : '0rem'}>  
          {NavigationSections.map((section: any, index: number) => (
            <Box key={`${section.sectionName}_${index}`}>
              {section.sectionName !== 'Dashboard' &&
                section.sectionName !== '' && (
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="gray.400"
                    px="6"
                    py="2"
                  >
                    {section.sectionName}
                  </Text>
                )}
              <VStack align="stretch">
                {section.items.map((link: any) => (
                  <NavItem
                    key={link.name}
                    icon={link.icon}
                    name={link.name}
                    link={link.link}
                    subItems={link.subItems}
                  />
                ))}
              </VStack>
            </Box>
          ))}
        </LoadingOverlay>
    </Box>
  );
};

const NavItem = ({
  icon,
  name,
  link,
  subItems,
  ...rest
}: LinkItemProps & FlexProps) => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = link ? pathname === link : false;
  const hasSubItems =
    subItems && Array.isArray(subItems) && subItems.length > 0;

  const handleClick = (event: React.MouseEvent) => {
    if (hasSubItems) {
      event.preventDefault(); // Prevent link navigation
      setIsOpen(!isOpen);
    }
  };

  if (hasSubItems || !link) {
    // Render as div if it has subItems or no link
    return (
      <Box {...rest}>
        <Flex
          align="center"
          p="2"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          color={isActive ? 'white' : 'gray.400'}
          bg={isActive ? 'whiteAlpha.200' : 'transparent'}
          _hover={{
            bg: 'whiteAlpha.200',
            color: 'white',
          }}
          onClick={handleClick}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{ color: 'white' }}
              as={icon}
            />
          )}
          <Text fontSize="xs">{name}</Text>
          {hasSubItems && (
            <Icon
              as={FiChevronDown}
              ml="auto"
              transform={isOpen ? 'rotate(180deg)' : 'rotate(0)'}
            />
          )}
        </Flex>
        {hasSubItems && (
          <Collapse in={isOpen} animateOpacity>
            <VStack align="stretch" pl="6" mt="2" spacing="0" width="full">
              {subItems.map((subItem) => (
                <NavItem key={subItem.name} {...subItem} />
              ))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  } else {
    // Render as RouterLink if it's a navigable link without subItems
    return (
      <ChakraLink
        as={RouterLink}
        to={link}
        // {...rest}
        // style={{ textDecoration: 'none' }}
      >
        <Flex
          align="center"
          p="2"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          color={isActive ? 'white' : 'gray.400'}
          bg={isActive ? 'whiteAlpha.200' : 'transparent'}
          _hover={{
            bg: 'whiteAlpha.200',
            color: 'white',
          }}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{ color: 'white' }}
              as={icon}
            />
          )}
          <Text fontSize="xs">{name}</Text>
        </Flex>
      </ChakraLink>
    );
  }
};

const MobileNav = ({ userInfo, onOpen, ...rest }: MobileProps) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { logout } = useAuthContext();

  const handleCloseModal = () => {
    setIsProfileModalOpen(false);
    setIsPasswordModalOpen(false);
  };

  useEffect(() => {}, []);
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="16"
      alignItems="center"
      bg={'white'}
      borderBottomWidth="1px"
      borderBottomColor={'gray.200'}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Image
        display={{ base: 'flex', md: 'none' }}
        src="/logo.png"
        alt="logo"
        height={'20'}
        width={'auto'}
      />

      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton
          isRound={true}
          variant="solid"
          aria-label="open menu"
          icon={<FiBell />}
        />
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
            >
              <HStack>
                <Avatar
                  size={'sm'}
                  src={
                    'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                  }
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                  width="5vw"
                >
                  <Text
                    fontWeight={'bold'}
                    fontSize="sm"
                    color={'gray.800'}
                    sx={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      width: '5vw',
                    }}
                  >
                    {Object.keys(userInfo).length > 0
                      ? userInfo?.first_name + ' ' + userInfo?.last_name
                      : 'Loading...'}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={'gray.800'}
                    opacity={0.6}
                    sx={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      width: '5vw',
                    }}
                  >
                    {Object.keys(userInfo).length > 0
                      ? userInfo?.role?.name
                      : 'Loading...'}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <Icon as={FiChevronDown} color="gray.400" />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList bg={'white'} borderColor={'gray.200'}>
              <MenuItem
                bg={'white'}
                color={'gray.800'}
                _hover={{ bg: 'gray.100' }}
                onClick={() => setIsProfileModalOpen(true)}
              >
                Edit Profile
              </MenuItem>
              <MenuItem
                bg={'white'}
                color={'gray.800'}
                _hover={{ bg: 'gray.100' }}
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Password Update
              </MenuItem>
              <MenuDivider />
              <MenuItem
                bg={'white'}
                color={'gray.800'}
                _hover={{ bg: 'gray.100' }}
                onClick={() => logout()}
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>

      <PasswordUpdateModal
        isOpen={isPasswordModalOpen}
        onClose={handleCloseModal}
      />
      <ProfileUpdateModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseModal}
        userInfo={userInfo}
      />
    </Flex>
  );
};

const Layout: FC<React.PropsWithChildren> = ({ children }) => {
  const { setUserInfo } = useUserContext();
  const [userInfo, setLoggedUserInfo] = useState<any>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { updateToken } = useAuthContext();
  const queryCache = useQueryClient();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const interceptor = Axios.interceptors.response.use(
      (r) => r,
      (error) => {
        if (
          error?.response?.status === 401 &&
          pathnameRef.current !== '/login'
        ) {
          queryCache.cancelQueries();
          updateToken(null);
          // if (pathname !== pathnameRef.current) {
          //   updateToken(null);
          // }
        }
        throw error;
      }
    );

    return () => Axios.interceptors.response.eject(interceptor);
  }, [updateToken, queryCache]);

  const getUserInfo = async () => {
    try {
      const data = await getAPICall(`/user/myprofile`, ProfilePayload);
      setLoggedUserInfo(data.data);
      setUserInfo(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
      <Box minH="100vh" bg={'gray.100'}>
        <SidebarContent
          onClose={() => onClose}
          display={{ base: 'none', md: 'block' }}
        />
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          // size="full"
        >
          <DrawerContent>
            <SidebarContent onClose={onClose} />
          </DrawerContent>
        </Drawer>
        {/* mobilenav */}
        <MobileNav userInfo={userInfo} onOpen={onOpen} />
        <Box ml={{ base: 0, md: 60 }} p="4">
          {children}
        </Box>
      </Box>
  );
};

export default Layout;
