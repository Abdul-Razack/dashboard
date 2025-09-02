import { Outlet, RouteObject } from 'react-router-dom';

import { ErrorPage } from '@/components/ErrorPage';
//Layout
import Layout from '@/layout/Layout';
import { AdminUserCreate } from '@/pages/AdminUsers/AdminUserCreate';
import { AdminUserDetails } from '@/pages/AdminUsers/AdminUserDetails';
//Admin User Routes
import { AdminUserMaster } from '@/pages/AdminUsers/AdminUserMaster';
import { AdminUserUpdate } from '@/pages/AdminUsers/AdminUserUpdate';
//Department Routes
import { DepartmentList } from '@/pages/AdminUsers/Departments/DepartmentList';
import MenuCreate from '@/pages/AdminUsers/Menu/MenuCreate';
// Admin User Menu Routes
import MenuMaster from '@/pages/AdminUsers/Menu/MenuMaster';
import { PermissionUpdate } from '@/pages/AdminUsers/Permissions/PermissionUpdate';
//User Role Routes
import { UserRoleList } from '@/pages/AdminUsers/UserRoles/UserRoleList';
import AuthenticatedRouteGuard from '@/pages/Auth/AuthenticatedRouteGuard';
//Auth Routes
import Login from '@/pages/Auth/Login';
import Logout from '@/pages/Auth/Logout';
import PublicRouteGuard from '@/pages/Auth/PublicRouteGuard';
//Dashboard
import Dashboard from '@/pages/Dashboard';
//Paymet Receipt Entry Routes
import ReceiptEntryCreate from '@/pages/Finance/PaymentReceiptEntry/ReceiptEntryCreate';
import { ProformaInvoiceCreate } from '@/pages/Finance/ProformaInvoice/ProformaInvoiceCreate';
import { ProformaInvoiceDetails } from '@/pages/Finance/ProformaInvoice/ProformaInvoiceDetails';
//Proforma Invoice Routes
import { ProformaInvoiceMaster } from '@/pages/Finance/ProformaInvoice/ProformaInvoiceMaster';
import { ProformaInvoiceUpdate } from '@/pages/Finance/ProformaInvoice/ProformaInvoiceUpdate';
import GRNCreate from '@/pages/Inward/GRN/GRNCreate';
import GRNDetails from '@/pages/Inward/GRN/GRNDetails';
import GRNLocationUpdate from '@/pages/Inward/GRN/GRNLocationUpdate';
import GRNMaster from '@/pages/Inward/GRN/GRNMaster';
import LRFQCreate from '@/pages/Logistics/LRFQ/LRFQCreate';
import { LRFQDetails } from '@/pages/Logistics/LRFQ/LRFQDetails';
// Logistics RFQ Routes
import LRFQMaster from '@/pages/Logistics/LRFQ/LRFQMaster';
import LogisticsOrderCreate from '@/pages/Logistics/Orders/LogisticsOrderCreate';
import { LogisticsOrderMaster } from '@/pages/Logistics/Orders/LogisticsOrderMaster';
// Logistics Order Routes
import { LogisticsOrderView } from '@/pages/Logistics/Orders/LogisticsOrderView';
// Logistics Quotation Routes
import { LogisticsQuotationCreate } from '@/pages/Logistics/Quotations/LogisticsQuotationCreate';
import LogisticsQuotationMaster from '@/pages/Logistics/Quotations/LogisticsQuotationMaster';
// Logistics Receive Routes
import { LogisticsReceiveMaster } from '@/pages/Logistics/Receive/ReceiveMaster';
import { LogisticsRequestCreate } from '@/pages/Logistics/Request/RequestCreate';
import { LogisticsRequestDetails } from '@/pages/Logistics/Request/RequestDetails';
import { LogisticsRequestEdit } from '@/pages/Logistics/Request/RequestEdit';
// Logistics Request Routes
import { LogisticsRequestMaster } from '@/pages/Logistics/Request/RequestMaster';
import { BankBulkUpload } from '@/pages/Master/Bank/BankBulkUpload';
//Bank Routes
import BankCreate from '@/pages/Master/Bank/BankCreate';
import BankDetails from '@/pages/Master/Bank/BankDetails';
import BankEdit from '@/pages/Master/Bank/BankEdit';
import BankList from '@/pages/Master/Bank/BankList';
import { ContactManagerBulkUpload } from '@/pages/Master/ContactManager/ContactManagerBulkUpload';
//Contact Manager Routes
import ContactManagerCreate from '@/pages/Master/ContactManager/ContactManagerCreate';
import ContactManageDetails from '@/pages/Master/ContactManager/ContactManagerDetails';
import ContactManagerEdit from '@/pages/Master/ContactManager/ContactManagerEdit';
import ContactManagerMaster from '@/pages/Master/ContactManager/ContactManagerMaster';
import { CustomerBulkUpload } from '@/pages/Master/Customer/CustomerBulkUpload';
//Customer Routes
import CustomerCreate from '@/pages/Master/Customer/CustomerCreate';
import CustomerDetails from '@/pages/Master/Customer/CustomerDetails';
import CustomerEdit from '@/pages/Master/Customer/CustomerEdit';
import CustomerMaster from '@/pages/Master/Customer/CustomerMaster';
import CustomerGroupCreate from '@/pages/Master/CustomerGroup/CustomerGroupCreate';
import CustomerGroupDetails from '@/pages/Master/CustomerGroup/CustomerGroupDetails';
import CustomerGroupEdit from '@/pages/Master/CustomerGroup/CustomerGroupEdit';
//Contact Group Routes
import CustomerGroupMaster from '@/pages/Master/CustomerGroup/CustomerGroupMaster';
import { OwnerPrincipleBulkUpload } from '@/pages/Master/OwnerPrinciple/OwnerPrincipleBulkUpload';
//Owner Principle Routes
import OwnerPrincipleCreate from '@/pages/Master/OwnerPrinciple/OwnerPrincipleCreate';
import OwnerPrincipleDetails from '@/pages/Master/OwnerPrinciple/OwnerPrincipleDetails';
import OwnerPrincipleEdit from '@/pages/Master/OwnerPrinciple/OwnerPrincipleEdit';
import OwnerPrincipleMaster from '@/pages/Master/OwnerPrinciple/OwnerPrincipleMaster';
import { ShippingAddressBulkUpload } from '@/pages/Master/ShippingAddress/ShippingAddressBulkUpload';
//Shipping Address Routes
import ShippingAddressCreate from '@/pages/Master/ShippingAddress/ShippingAddressCreate';
import ShippingAddressDetails from '@/pages/Master/ShippingAddress/ShippingAddressDetails';
import ShippingAddressEdit from '@/pages/Master/ShippingAddress/ShippingAddressEdit';
import ShippingAddressList from '@/pages/Master/ShippingAddress/ShippingAddressList';
import AssignAlternateParts from '@/pages/Master/Spares/AssignAlternateParts';
import { SparesBulkUpload } from '@/pages/Master/Spares/SparesBulkUpload';
import SparesCreate from '@/pages/Master/Spares/SparesCreate';
import SparesDetails from '@/pages/Master/Spares/SparesDetails';
import SparesEdit from '@/pages/Master/Spares/SparesEdit';
//Spare Routes
import SparesMaster from '@/pages/Master/Spares/SparesMaster';
import { TraderReferenceBulkUpload } from '@/pages/Master/TraderReference/TraderReferenceBulkUpload';
//Trader Reference Routes
import TraderReferenceCreate from '@/pages/Master/TraderReference/TraderReferenceCreate';
import TraderReferenceDetails from '@/pages/Master/TraderReference/TraderReferenceDetails';
import TraderReferenceEdit from '@/pages/Master/TraderReference/TraderReferenceEdit';
import TraderReferenceMaster from '@/pages/Master/TraderReference/TraderReferenceMaster';
//External Preview Routes
import { POPreview } from '@/pages/Preview/POPreview';
import { PRFQPreview } from '@/pages/Preview/PRFQPreview';
import CreateInspection from '@/pages/Purchase/Inspection/CreateInspection';
import InspectionDashboard from '@/pages/Purchase/Inspection/InspectionDashboard';
//Inspection Pages
import NewInspection from '@/pages/Purchase/Inspection/NewInspection';
// Material Request Routes
import { MaterialRequestCreate } from '@/pages/Purchase/MaterialRequest/MaterialRequestCreate';
import MaterialRequestDetails from '@/pages/Purchase/MaterialRequest/MaterialRequestDetails';
import MaterialRequestEdit from '@/pages/Purchase/MaterialRequest/MaterialRequestEdit';
import MaterialRequestLogs from '@/pages/Purchase/MaterialRequest/MaterialRequestLogs';
import MaterialRequestMaster from '@/pages/Purchase/MaterialRequest/MaterialRequestMaster';
//PRFQ Routes
import PRFQCreate from '@/pages/Purchase/PRFQ/PRFQCreate';
import PRFQDetails from '@/pages/Purchase/PRFQ/PRFQDetails';
import PRFQEdit from '@/pages/Purchase/PRFQ/PRFQEdit';
import PRFQMaster from '@/pages/Purchase/PRFQ/PRFQMaster';
//Purchase Order Routes
import PurchaseOrderCreate from '@/pages/Purchase/PurchaseOrder/PurchaseOrderCreate';
import PurchaseOrderDetails from '@/pages/Purchase/PurchaseOrder/PurchaseOrderDetails';
import PurchaseOrderDirectCreate from '@/pages/Purchase/PurchaseOrder/PurchaseOrderDirectCreate';
import PurchaseOrderDirectUpdate from '@/pages/Purchase/PurchaseOrder/PurchaseOrderDirectUpdate';
import PurchaseOrderMaster from '@/pages/Purchase/PurchaseOrder/PurchaseOrderMaster';
import PurchaseOrderUpdate from '@/pages/Purchase/PurchaseOrder/PurchaseOrderUpdate';
// Quality Check
import QualityCheck from '@/pages/Purchase/QualityCheck';
import QuarantineApproval from '@/pages/Purchase/QuarantineApproval';
import QuotationComparison from '@/pages/Purchase/Quotation/QuotationComparison';
//Quotation Routes
import SupplierPricingUpdate from '@/pages/Purchase/Quotation/SupplierPricingUpdate';
import SupplierQuotationCreate from '@/pages/Purchase/Quotation/SupplierQuotationCreate';
import SupplierQuotationDetails from '@/pages/Purchase/Quotation/SupplierQuotationDetails';
import SupplierQuotationEdit from '@/pages/Purchase/Quotation/SupplierQuotationEdit';
import SupplierQuotationMaster from '@/pages/Purchase/Quotation/SupplierQuotationMaster';
import SupplierQuotationUpdate from '@/pages/Purchase/Quotation/SupplierQuotationUpdate';
//STF Routes
import STFCreate from '@/pages/Purchase/STF/STFCreate';
import STFDetails from '@/pages/Purchase/STF/STFDetails';
import STFLatestCreate from '@/pages/Purchase/STF/STFLatestCreate';
import STFMaster from '@/pages/Purchase/STF/STFMaster';
import { RepairLogCreate } from '@/pages/RepairLogs/RepairLogCreate';
// Repair > Log
import { RepairLogMaster } from '@/pages/RepairLogs/RepairLogMaster';
import { SELCreate } from '@/pages/Sales/SEL/SELCreate';
import { SELDetails } from '@/pages/Sales/SEL/SELDetails';
import { SELEdit } from '@/pages/Sales/SEL/SELEdit';
// Sales > SEL
import SELMaster from '@/pages/Sales/SEL/SELMaster';
import BinLocationList from '@/pages/Submaster/BinLocation/BinLocationList';
import BusinessTypeList from '@/pages/Submaster/BusinessType/BusinessTypeList';
import ConditionList from '@/pages/Submaster/Condition/ConditionList';
import ContactTypeList from '@/pages/Submaster/ContactType/ContactTypeList';
import CurrencyList from '@/pages/Submaster/Currency/CurrencyList';
import CustomEntryList from '@/pages/Submaster/CustomEntry/CustomEntryList';
import CustomerGroupList from '@/pages/Submaster/CustomerGroup/CustomerGroupList';
import { EmailAlertMaster } from '@/pages/Submaster/EmailAlert/EmailAlertMaster';
import FOBList from '@/pages/Submaster/FOB/FOBList';
import HSCList from '@/pages/Submaster/HscCode/HSCList';
import PackageTypeList from '@/pages/Submaster/PackageType/PackageTypeList';
import PaymentModeList from '@/pages/Submaster/PaymentMode/PaymentModeList';
import PaymentTermsList from '@/pages/Submaster/PaymentTerms/PaymentTermsList';
import PriorityList from '@/pages/Submaster/Priority/PriorityList';
import RackList from '@/pages/Submaster/Rack/RackList';
import ShipAccountList from '@/pages/Submaster/ShipAccounts/ShipAccountList';
import ShipModeList from '@/pages/Submaster/ShipMode/ShipModeList';
import ShipTypeList from '@/pages/Submaster/ShipType/ShipTypeList';
import ShipViaList from '@/pages/Submaster/ShipVia/ShipViaList';
import SpareClassList from '@/pages/Submaster/SpareClass/SpareClassList';
import SpareModelList from '@/pages/Submaster/SpareModel/SpareModelList';
import SpareTypeList from '@/pages/Submaster/SpareType/SpareTypeList';
import ModeOfReceiptList from '@/pages/Submaster/ModeOfReceipt/ModeOfReceiptList';
//Warehouse Routes
import WarehouseCreate from '@/pages/Submaster/Warehouses/WarehouseCreate';
import WarehouseDetails from '@/pages/Submaster/Warehouses/WarehouseDetails';
import WarehouseEdit from '@/pages/Submaster/Warehouses/WarehouseEdit';
import WarehouseList from '@/pages/Submaster/Warehouses/WarehouseList';
//Unauthorized Route
import Unauthorized from '@/pages/Unauthorized';
import { RouteProvider } from '@/services/auth/RouteContext';
import { UserProvider } from '@/services/auth/UserContext';

{
  /* Master Routes Start! */
}

{
  /* Master Routes End! */
}
{
  /* Sub Master Routes Start! */
}

{
  /* Sub Master Routes End! */
}
{
  /* Purchase Routes Start! */
}

{
  /* Purchase Routes Ends! */
}
{
  /* Finance Routes Ends! */
}

{
  /* Finance Routes Ends! */
}
{
  /* Logistics Routes Starts! */
}

export const routes = [
  {
    path: '/',
    errorElement: <ErrorPage />,
    element: (
      <>
        <Outlet />
      </>
    ),
    children: [
      {
        path: 'logout',
        element: <Logout />,
      },

      /**
       * Public Routes
       */
      {
        path: 'login',
        element: (
          <PublicRouteGuard>
            <Login />
          </PublicRouteGuard>
        ),
      },
      {
        path: 'preview/purchase-order/:token',
        element: <POPreview />,
      },
      {
        path: 'preview/prfq/:token',
        element: <PRFQPreview />,
      },
      /**
       * Authenticated Routes
       */
      {
        path: '',
        element: (
          <AuthenticatedRouteGuard>
            <UserProvider>
              <RouteProvider>
                <Layout>
                  <Outlet />
                </Layout>
              </RouteProvider>
            </UserProvider>
          </AuthenticatedRouteGuard>
        ),
        children: [
          {
            path: '',
            element: <Dashboard />,
          },
          {
            path: '/unauthorized',
            element: <Unauthorized />,
          },
          { path: 'departments', element: <DepartmentList /> },
          { path: 'user-roles', element: <UserRoleList /> },
          {
            path: 'permissions',
            children: [{ path: ':id/info', element: <PermissionUpdate /> }],
          },
          {
            path: 'admin-users',
            children: [
              { path: '', element: <AdminUserMaster /> },
              { path: 'create', element: <AdminUserCreate /> },
              { path: ':id', element: <AdminUserDetails /> },
              { path: ':id/edit', element: <AdminUserUpdate /> },
            ],
          },
          {
            path: 'menu',
            children: [
              { path: '', element: <MenuMaster /> },
              {
                path: 'create',
                element: <MenuCreate />,
              },
            ],
          },
          {
            path: 'customer-master',
            children: [
              { path: '', element: <CustomerMaster /> },
              {
                path: 'create',
                element: <CustomerCreate />,
              },
              {
                path: ':id',
                element: <CustomerDetails />,
              },
              {
                path: ':id/edit',
                element: <CustomerEdit />,
              },
              {
                path: 'bulk/upload',
                element: <CustomerBulkUpload />,
              },
            ],
          },
          {
            path: 'bank-master',
            children: [
              { path: '', element: <BankList /> },
              {
                path: 'create',
                element: <BankCreate />,
              },
              {
                path: ':id',
                element: <BankDetails />,
              },
              {
                path: ':id/edit',
                element: <BankEdit />,
              },
              {
                path: 'bulk/upload',
                element: <BankBulkUpload />,
              },
            ],
          },
          {
            path: 'shipping-address-master',
            children: [
              { path: '', element: <ShippingAddressList /> },
              {
                path: 'create',
                element: <ShippingAddressCreate />,
              },
              {
                path: ':id',
                element: <ShippingAddressDetails />,
              },
              {
                path: ':id/edit',
                element: <ShippingAddressEdit />,
              },
              {
                path: 'bulk/upload',
                element: <ShippingAddressBulkUpload />,
              },
            ],
          },
          {
            path: 'contact-manager-master',
            children: [
              { path: '', element: <ContactManagerMaster /> },
              {
                path: 'create',
                element: <ContactManagerCreate />,
              },
              {
                path: ':id',
                element: <ContactManageDetails />,
              },
              {
                path: ':id/edit',
                element: <ContactManagerEdit />,
              },
              {
                path: 'bulk/upload',
                element: <ContactManagerBulkUpload />,
              },
            ],
          },
          {
            path: 'trader-reference-master',
            children: [
              { path: '', element: <TraderReferenceMaster /> },
              {
                path: 'create',
                element: <TraderReferenceCreate />,
              },
              {
                path: ':id',
                element: <TraderReferenceDetails />,
              },
              {
                path: ':id/edit',
                element: <TraderReferenceEdit />,
              },
              {
                path: 'bulk/upload',
                element: <TraderReferenceBulkUpload />,
              },
            ],
          },
          {
            path: 'principle-of-owner-master',
            children: [
              { path: '', element: <OwnerPrincipleMaster /> },
              {
                path: 'create',
                element: <OwnerPrincipleCreate />,
              },
              {
                path: ':id',
                element: <OwnerPrincipleDetails />,
              },
              {
                path: ':id/edit',
                element: <OwnerPrincipleEdit />,
              },
              {
                path: 'bulk/upload',
                element: <OwnerPrincipleBulkUpload />,
              },
            ],
          },
          {
            path: 'spares-master',
            children: [
              { path: '', element: <SparesMaster /> },
              {
                path: 'create/:spare_name?',
                element: <SparesCreate />,
              },
              {
                path: ':id',
                element: <SparesDetails />,
              },
              {
                path: ':id/assign-alternate',
                element: <AssignAlternateParts />,
              },
              {
                path: ':id/edit',
                element: <SparesEdit />,
              },
              {
                path: 'bulk/upload',
                element: <SparesBulkUpload />,
              },
            ],
          },
          {
            path: 'customer-group-master',
            children: [
              { path: '', element: <CustomerGroupMaster /> },
              {
                path: 'create',
                element: <CustomerGroupCreate />,
              },
              {
                path: ':id',
                element: <CustomerGroupDetails />,
              },
              {
                path: ':id/edit',
                element: <CustomerGroupEdit />,
              },
            ],
          },
          {
            path: 'purchase',
            children: [
              {
                path: 'purchase-request',
                children: [
                  { path: '', element: <MaterialRequestMaster /> },
                  { path: 'create', element: <MaterialRequestCreate /> },
                  { path: ':id', element: <MaterialRequestDetails /> },
                  { path: ':id/edit', element: <MaterialRequestEdit /> },
                  { path: ':id/logs', element: <MaterialRequestLogs /> },
                ],
              },
              {
                path: 'prfq',
                children: [
                  { path: '', element: <PRFQMaster /> },
                  { path: 'create', element: <PRFQCreate /> },
                  { path: ':id', element: <PRFQDetails /> },
                  { path: ':id/edit', element: <PRFQEdit /> },
                ],
              },
              {
                path: 'quotation',
                children: [
                  { path: '', element: <SupplierQuotationMaster /> },
                  { path: 'create', element: <SupplierQuotationCreate /> },
                  { path: ':id/update', element: <SupplierQuotationUpdate /> },
                  {
                    path: 'pricing/:quotationId/update',
                    element: <SupplierPricingUpdate />,
                  },
                  { path: ':id', element: <SupplierQuotationDetails /> },
                  { path: ':id/edit', element: <SupplierQuotationEdit /> },
                  {
                    path: 'comparison/:rfqId',
                    element: <QuotationComparison />,
                  },
                ],
              },
              {
                path: 'purchase-order',
                children: [
                  { path: '', element: <PurchaseOrderMaster /> },
                  { path: 'create', element: <PurchaseOrderCreate /> },
                  { path: 'direct', element: <PurchaseOrderDirectCreate /> },
                  { path: ':id', element: <PurchaseOrderDetails /> },
                  { path: ':id/edit', element: <PurchaseOrderUpdate /> },
                  {
                    path: ':id/direct/edit',
                    element: <PurchaseOrderDirectUpdate />,
                  },
                ],
              },
              {
                path: 'stf',
                children: [
                  { path: '', element: <STFMaster /> },
                  { path: 'create', element: <STFCreate /> },
                  { path: 'add/new/:id?', element: <STFLatestCreate /> },
                  { path: ':id', element: <STFDetails /> },
                  // { path: ':id/edit', element: <STFEdit /> },
                ],
              },
            ],
          },
          {
            path: 'inward',
            children: [
              {
                path: 'grn',
                children: [
                  { path: '', element: <GRNMaster /> },
                  { path: 'create', element: <GRNCreate /> },
                  { path: 'location/update', element: <GRNLocationUpdate /> },
                  { path: ':id', element: <GRNDetails /> },
                  // { path: ':id/edit', element: <STFEdit /> },
                ],
              },
            ],
          },
          {
            path: 'finance',
            children: [
              {
                path: 'proforma-invoice',
                children: [
                  { path: '', element: <ProformaInvoiceMaster /> },
                  { path: 'create', element: <ProformaInvoiceCreate /> },
                  { path: ':id', element: <ProformaInvoiceDetails /> },
                  { path: ':id/edit', element: <ProformaInvoiceUpdate /> },
                ],
              },
            ],
          },
          {
            path: 'payment',
            children: [
              {
                path: 'receipt-entry',
                children: [{ path: '', element: <ReceiptEntryCreate /> }],
              },
            ],
          },
          {
            path: 'logistics',
            children: [
              {
                path: 'request',
                children: [
                  { path: '', element: <LogisticsRequestMaster /> },
                  { path: 'create', element: <LogisticsRequestCreate /> },
                  { path: ':id', element: <LogisticsRequestDetails /> },
                  { path: ':id/edit', element: <LogisticsRequestEdit /> },
                ],
              },
              {
                path: 'receive',
                children: [{ path: '', element: <LogisticsReceiveMaster /> }],
              },
              { path: 'order/master', element: <LogisticsOrderMaster /> },
              { path: 'order/:id', element: <LogisticsOrderView /> },
              { path: 'order/create', element: <LogisticsOrderCreate /> },
              {
                path: 'quotation/master',
                element: <LogisticsQuotationMaster />,
              },
              {
                path: 'quotation/create',
                element: <LogisticsQuotationCreate />,
              },

              {
                path: 'lrfq',
                children: [
                  { path: '', element: <LRFQMaster /> },
                  { path: 'create', element: <LRFQCreate /> },
                  { path: ':id', element: <LRFQDetails /> },
                  // { path: ':id/edit', element: <PRFQEdit /> },
                ],
              },
            ],
          },
          {
            path: 'submaster',
            children: [
              { path: 'customer-group', element: <CustomerGroupList /> },
              { path: 'business-type', element: <BusinessTypeList /> },
              { path: 'contact-type', element: <ContactTypeList /> },
              { path: 'currencies', element: <CurrencyList /> },
              { path: 'payment-mode', element: <PaymentModeList /> },
              { path: 'payment-terms', element: <PaymentTermsList /> },
              { path: 'spare-class', element: <SpareClassList /> },
              { path: 'spare-model', element: <SpareModelList /> },
              { path: 'spare-type', element: <SpareTypeList /> },
              { path: 'priorities', element: <PriorityList /> },
              { path: 'conditions', element: <ConditionList /> },
              { path: 'fob', element: <FOBList /> },
              { path: 'ship-accounts', element: <ShipAccountList /> },
              { path: 'ship-modes', element: <ShipModeList /> },
              { path: 'ship-via', element: <ShipViaList /> },
              { path: 'custom-entry', element: <CustomEntryList /> },
              { path: 'package-type', element: <PackageTypeList /> },
              { path: 'ship-type', element: <ShipTypeList /> },
              { path: 'hsc-code', element: <HSCList /> },
              { path: 'mode-of-receipt', element: <ModeOfReceiptList /> },
              {
                path: 'warehouse',
                children: [
                  { path: '', element: <WarehouseList /> },
                  { path: 'create', element: <WarehouseCreate /> },
                  { path: ':id', element: <WarehouseDetails /> },
                  { path: ':id/edit', element: <WarehouseEdit /> },
                ],
              },
              { path: 'rack', element: <RackList /> },
              { path: 'bin-location', element: <BinLocationList /> },
              { path: '', element: <ErrorPage /> },
            ],
          },
          {
            path: 'inspection',
            children: [
              { path: '', element: <NewInspection /> },
              { path: 'dashboard', element: <InspectionDashboard /> },
              { path: 'create', element: <CreateInspection /> },
            ],
          },
          {
            path: 'qc',
            children: [{ path: 'approval', element: <QualityCheck /> }],
          },
          {
            path: 'quarantine',
            children: [{ path: 'approval', element: <QuarantineApproval /> }],
          },
          {
            path: 'email-alert',
            children: [{ path: 'master', element: <EmailAlertMaster /> }],
          },
          {
            path: 'sel-master',
            children: [
              { path: '', element: <SELMaster /> },
              {
                path: 'create',
                element: <SELCreate />,
              },
              {
                path: ':id',
                element: <SELDetails />,
              },
              {
                path: ':id/edit',
                element: <SELEdit />,
              },
              // {
              //   path: 'bulk/upload',
              //   element: <ShippingAddressBulkUpload />
              // }
            ],
          },
          {
            path: 'repair-master',
            children: [
              { path: '', element: <RepairLogMaster /> },
              {
                path: 'create',
                element: <RepairLogCreate />,
              },
              // {
              //   path: ':id',
              //   element: <SELDetails />,
              // },
              // {
              //   path: ':id/edit',
              //   element: <SELEdit />,
              // },
              // {
              //   path: 'bulk/upload',
              //   element: <ShippingAddressBulkUpload />
              // }
            ],
          },
        ],
      },

      { path: '*', element: <ErrorPage /> },
    ],
  },
  { path: '*', element: <ErrorPage /> },
] satisfies RouteObject[];
