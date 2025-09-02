import { useEffect, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Checkbox,
  HStack,
  Heading,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCreateAdminUser } from '@/services/adminuser/services';

export const PermissionUpdate = () => {
  const currentPermissions: TODO = {
    admin_users: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/admin-users',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/admin-users/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/admin-users/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/admin-users/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/admin-users/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    user_roles: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/user-roles',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/user-role/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/user-role/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/user-role/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/user-role/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    departments: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/departments',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/department/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/department/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/department/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/department/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    permissions: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/permissions',
        hasPermission: 1,
        isExist: 0,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/permission/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/permission/create',
        hasPermission: 1,
        isExist: 0,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/permission/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/permission/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    customer_master: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/customer-master',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/customer-master/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/customer-master/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/customer-master/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/customer-master/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    bank_master: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/bank-master',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/bank-master/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/bank-master/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/bank-master/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/bank-master/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    principle_of_owner_master: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/principle-of-owner-master',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/principle-of-owner-master/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/principle-of-owner-master/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/principle-of-owner-master/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/principle-of-owner-master/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    contact_manager_master: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/contact-manager-master',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/contact-manager-master/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/contact-manager-master/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/contact-manager-master/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/contact-manager-master/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    trader_reference_master: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/trader-reference-master',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/trader-reference-master/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/trader-reference-master/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/trader-reference-master/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/trader-reference-master/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    shipping_address_master: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/shipping-address-master',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/shipping-address-master/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/shipping-address-master/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/shipping-address-master/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/shipping-address-master/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    business_type: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/business-type',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/business-type/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/business-type/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/business-type/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/business-type/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    contact_type: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/contact-type',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/contact-type/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/contact-type/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/contact-type/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/contact-type/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    currencies: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/currencies',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/currencies/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/currencies/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/currencies/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/currencies/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    payment_mode: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/payment-mode',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/payment-mode/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/payment-mode/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/payment-mode/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/payment-mode/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    payment_terms: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/payment-terms',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/payment-terms/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/payment-terms/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/payment-terms/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/payment-terms/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    spare_class: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/spare-class',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/spare-class/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/spare-class/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/spare-class/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/spare-class/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    spare_type: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/spare-type',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/spare-type/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/spare-type/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/spare-type/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/spare-type/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    spare_model: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/spare-model',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/spare-model/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/spare-model/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/spare-model/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/spare-model/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    priorities: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/priorities',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/priorities/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/priorities/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/priorities/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/priorities/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    conditions: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/conditions',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/conditions/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/conditions/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/conditions/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/conditions/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    fob: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/fob',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/fob/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/fob/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/fob/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/fob/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    ship_accounts: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/ship-accounts',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/ship-accounts/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/ship-accounts/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/ship-accounts/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/ship-accounts/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    ship_modes: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/ship-modes',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/ship-modes/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/ship-modes/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/ship-modes/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/ship-modes/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    ship_via: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/ship-via',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/ship-via/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/ship-via/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/ship-via/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/ship-via/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    custom_entry: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/custom-entry',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/custom-entry/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/custom-entry/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/custom-entry/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/custom-entry/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    package_type: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/package-type',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/package-type/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/package-type/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/package-type/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/package-type/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    ship_type: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/ship-type',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/ship-type/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/ship-type/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/ship-type/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/ship-type/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    warehouse: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/warehouse',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/warehouse/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/warehouse/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/warehouse/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/warehouse/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    rack: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/rack',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/rack/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/rack/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/rack/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/rack/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    bin_location: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/bin-location',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/bin-location/:id',
        hasPermission: 1,
        isExist: 0,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/bin-location/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/bin-location/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/bin-location/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
    spare_master: {
      list: {
        name: 'listing',
        label: 'List',
        url: '/spare-master',
        hasPermission: 1,
        isExist: 1,
      },
      view: {
        name: 'view',
        label: 'View',
        url: '/spare-master/:id',
        hasPermission: 1,
        isExist: 1,
      },
      create: {
        name: 'create',
        label: 'Create',
        url: '/spare-master/create',
        hasPermission: 1,
        isExist: 1,
      },
      update: {
        name: 'update',
        label: 'Update',
        url: '/spare-master/:id/edit',
        hasPermission: 1,
        isExist: 1,
      },
      delete: {
        name: 'delete',
        label: 'Delete',
        url: '/spare-master/:id/delete',
        hasPermission: 0,
        isExist: 0,
      },
    },
  };

  const [permission, setPermissions] = useState<TODO>(currentPermissions);

  const handleChange = (key: string, innerKey: string, checked: boolean) => {
    setPermissions((prevData: any) => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        [innerKey]: {
          ...prevData[key][innerKey],
          hasPermission: checked ? 1 : 0,
        },
      },
    }));
  };

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();

  const form = useForm({
    onValidSubmit: (values) => {
      const payload = {
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        department_id: Number(values.department_id),
        role_id: Number(values.role_id),
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      createAdminUser.mutate(payload);
    },
  });

  const createAdminUser = useCreateAdminUser({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'User created successfully - ' + id,
        description: message,
      });
      navigate('/admin-users');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create admin user',
        description: error.response?.data.message,
      });
    },
  });

  useEffect(() => {
    console.log(permission);
  }, [permission]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={2}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink>
                  User Access
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Settings</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Super Admin - Permissions
            </Heading>
          </Stack>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<HiArrowNarrowLeft />}
            size={'sm'}
            fontWeight={'thin'}
            onClick={() => navigate(-1)}
          >
            Back
          </ResponsiveIconButton>
        </HStack>
        <Stack
          spacing={2}
          p={4}
          bg={'white'}
          borderRadius={'md'}
          boxShadow={'md'}
        >
          <Formiz autoForm connect={form}>
            {Object.keys(permission).map((key) => (
              <Stack
                spacing={4}
                direction={'row'}
                alignItems={'start'}
                key={key}
                padding={2}
              >
                <Box flex={2}>
                  <Text
                    fontSize={'md'}
                    fontWeight={'700'}
                    textTransform={'capitalize'}
                  >
                    {key.replace(/_/g, ' ')}
                  </Text>
                </Box>
                <Box flex={8}>
                  <Stack spacing={4} direction={'row'}>
                    {Object.keys(permission[key]).map((newKey) => (
                      <Checkbox
                        colorScheme="green"
                        key={newKey}
                        textTransform={'capitalize'}
                        isChecked={ permission[key][newKey].hasPermission === 1 ? true : false }
                        isDisabled={ permission[key][newKey].isExist === 1 ? false : true }
                        onChange={(e) =>
                          handleChange(key, newKey, e.target.checked)
                        }
                      >
                        <Tooltip
                          hasArrow
                          placement="top"
                          key={newKey}
                          label={`${key.replace(/_/g, ' ')} ${newKey} Access ${permission[key][newKey].hasPermission === 1 ? 'Enabled' : 'Disabled'}`}
                          aria-label={`${newKey}  - Access`}
                          textTransform={'capitalize'}
                        >
                          <Text>{newKey} - Access</Text>
                        </Tooltip>
                      </Checkbox>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            ))}
            {/* Button action */}
            <HStack justifyContent={'center'} mt={2}>
              <HStack spacing={2} align="center" marginTop={'1rem'}>
                <Button
                  colorScheme="green"
                  size={'sm'}
                  mx={'auto'}
                  mt={4}
                  type="submit"
                  isLoading={createAdminUser.isLoading}
                >
                  Submit
                </Button>

                <Button
                  colorScheme="red"
                  size={'sm'}
                  mx={'auto'}
                  mt={4}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </HStack>
            </HStack>
            {/* End */}
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default PermissionUpdate;
