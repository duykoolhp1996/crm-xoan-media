import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, LeadSource, PipelineStage } from '../../types';
import { VIETNAM_LOCATIONS, getDistrictsByCity } from '../../data/vietnamLocations';
import {
  getSalesHierarchyInfo,
  getAssignableSalesList
} from '../../utils/salesPermissions';
import {
  X,
  Sparkles,
  User,
  School,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  Headphones,
  UserCheck,
  Globe,
  Layers,
  AlertTriangle,
  Calculator,
  Camera,
  CheckCircle2,
  Clock,
  FolderOpen,
  UserX,
  CreditCard,
  Wallet,
  Users,
  Video
} from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

// Helper chuẩn hóa số tiền từ chuỗi (hỗ trợ '100.000', '1,500,000', '1.500.000đ')
const parseMoneyInput = (val: string | number): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Các giai đoạn trước cọc (tiếp nhận, tư vấn, gửi báo giá) KHÔNG BẮT BUỘC số điện thoại & tên lớp
const STAGES_WITHOUT_REQUIRED_CONTACT: PipelineStage[] = [
  'New Lead',
  'Đang tư vấn',
  'Đã liên hệ',
  'Đang thương lượng',
  'Đã gửi báo giá',
  'Lost'
];

export const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customerToEdit }) => {
  const {
    addCustomer,
    updateCustomer,
    schools,
    servicePackages,
    salesStaff,
    photographers,
    bookings,
    updateBooking,
    addBooking,
    getPhotographerAvailability,
    addActivityLog,
    currentUser,
    currentRole,
    customers
  } = useApp();

  const salesHierarchy = useMemo(() => {
    return getSalesHierarchyInfo(currentUser, currentRole, salesStaff);
  }, [currentUser, currentRole, salesStaff]);

  const assignableSalesList = useMemo(() => {
    return getAssignableSalesList(currentUser, currentRole, salesStaff);
  }, [currentUser, currentRole, salesStaff]);

  const isSalesStaffUser = currentUser.role === 'sales' || currentRole === 'sales';
  const isLead = salesHierarchy.isLead;

  // Tự động gán Sales là chính mình nếu user đang đăng nhập có vai trò Sales
  const initialSalesName = isSalesStaffUser ? currentUser.name : 'Chưa gán';

  const getInitialFormData = () => {
    if (customerToEdit) {
      const studentCount = customerToEdit.studentCount !== undefined && customerToEdit.studentCount !== null
        ? Number(customerToEdit.studentCount)
        : 35;
      const unitPrice = (customerToEdit.unitPrice !== undefined && customerToEdit.unitPrice !== null)
        ? Number(customerToEdit.unitPrice)
        : (customerToEdit.expectedBudget !== undefined && customerToEdit.expectedBudget !== null && studentCount > 0
            ? Math.round(Number(customerToEdit.expectedBudget) / studentCount)
            : 350000);
      const extraFee = (customerToEdit.extraFee !== undefined && customerToEdit.extraFee !== null) ? Number(customerToEdit.extraFee) : 0;
      const discount = (customerToEdit.discount !== undefined && customerToEdit.discount !== null) ? Number(customerToEdit.discount) : 0;
      const subtotal = (customerToEdit.subtotal !== undefined && customerToEdit.subtotal !== null)
        ? Number(customerToEdit.subtotal)
        : (studentCount * unitPrice);
      const totalAmount = (customerToEdit.totalAmount !== undefined && customerToEdit.totalAmount !== null)
        ? Number(customerToEdit.totalAmount)
        : (customerToEdit.totalRevenue !== undefined && customerToEdit.totalRevenue !== null)
          ? Number(customerToEdit.totalRevenue)
          : (subtotal + extraFee - discount);
      const depositAmount = (customerToEdit.depositAmount !== undefined && customerToEdit.depositAmount !== null)
        ? Number(customerToEdit.depositAmount)
        : 0;
      const paidAmount = (customerToEdit.paidAmount !== undefined && customerToEdit.paidAmount !== null)
        ? Number(customerToEdit.paidAmount)
        : depositAmount;
      const remainingAmount = (customerToEdit.remainingAmount !== undefined && customerToEdit.remainingAmount !== null)
        ? Number(customerToEdit.remainingAmount)
        : Math.max(0, totalAmount - paidAmount);
      const expectedBudget = (customerToEdit.expectedBudget !== undefined && customerToEdit.expectedBudget !== null)
        ? Number(customerToEdit.expectedBudget)
        : totalAmount;

      // Tra cứu booking tương ứng (nếu có) để lấy chính xác ekip và lịch chụp
      const matchedBk = bookings.find(
        b => b.customerId === customerToEdit.id ||
        (b.className && b.className === customerToEdit.className && b.schoolName === customerToEdit.schoolName)
      );

      let initialLeadId = matchedBk?.assignments?.leadPhotographerId || customerToEdit.leadPhotographerId || '';
      let initialLeadName = matchedBk?.assignments?.leadPhotographerName || customerToEdit.leadPhotographerName || '';
      if (!initialLeadId && customerToEdit.notes) {
        const foundPhoto = photographers.find(p => customerToEdit.notes?.toLowerCase().includes(p.fullName.toLowerCase()));
        if (foundPhoto) {
          initialLeadId = foundPhoto.id;
          initialLeadName = foundPhoto.fullName;
        }
      }

      const initialVideoId = matchedBk?.assignments?.videographerId || customerToEdit.videographerId || '';
      const initialAssistantIds = matchedBk?.assignments?.assistantPhotographerIds || customerToEdit.assistantPhotographerIds || [];
      const initialPhotoNotes = matchedBk?.photoNotes || matchedBk?.notes || customerToEdit.photoNotes || '';

      return {
        name: customerToEdit.name || '',
        phone: customerToEdit.phone || '',
        email: customerToEdit.email || '',
        facebook: customerToEdit.facebook || '',
        zalo: customerToEdit.zalo || '',
        schoolName: customerToEdit.schoolName || (schools[0]?.name || 'THPT Chuyên Trần Phú (Hải Phòng)'),
        grade: customerToEdit.grade || 'Khối 12',
        className: customerToEdit.className || '',
        academicYear: customerToEdit.academicYear || '2025-2026',
        city: customerToEdit.city || 'Hải Phòng',
        district: customerToEdit.district || 'Lê Chân',
        region: customerToEdit.region || 'Lê Chân, Hải Phòng',
        representativeRole: customerToEdit.representativeRole || 'Lớp trưởng',
        studentCount: studentCount,
        serviceType: customerToEdit.serviceType || 'Kỷ yếu Concept',
        servicePackageId: customerToEdit.servicePackageId || (servicePackages[1]?.id || ''),
        concept: customerToEdit.concept || '',
        expectedShootDate: matchedBk?.shootDate || customerToEdit.expectedShootDate || '',
        shootingLocations: Array.isArray(customerToEdit.shootingLocations)
          ? customerToEdit.shootingLocations.join(', ')
          : (customerToEdit.shootingLocations || 'Trường học & Nhà Hát Lớn / Bãi biển Đồ Sơn'),
        
        // Auto-Pricing Fields
        unitPrice: unitPrice,
        subtotal: subtotal,
        extraFee: extraFee,
        discount: discount,
        totalAmount: totalAmount,
        depositAmount: depositAmount,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        expectedBudget: expectedBudget,

        // Stage-specific fields
        depositDate: customerToEdit.depositDate || '',
        paymentMethod: customerToEdit.paymentMethod || 'vietqr',
        shootTime: matchedBk?.startTime || customerToEdit.shootTime || '07:30',
        shootAddress: matchedBk?.location || customerToEdit.shootAddress || '',
        leadPhotographerId: initialLeadId,
        leadPhotographerName: initialLeadName,
        videographerId: initialVideoId,
        assistantPhotographerIds: initialAssistantIds,
        photoNotes: initialPhotoNotes,
        editorName: customerToEdit.editorName || '',
        editDeadline: customerToEdit.editDeadline || '',
        editProgress: customerToEdit.editProgress || 0,
        deliveredDate: customerToEdit.deliveredDate || '',
        deliveredDriveUrl: customerToEdit.deliveredDriveUrl || '',
        deliveryMethod: customerToEdit.deliveryMethod || 'drive_link',
        lostReason: customerToEdit.lostReason || '',
        lostNote: customerToEdit.lostNote || '',

        specialRequests: customerToEdit.specialRequests || '',
        notes: customerToEdit.notes || '',
        source: (customerToEdit.source || 'Facebook Ads') as LeadSource,
        campaignName: customerToEdit.campaignName || 'Mùa_Kỷ_Yếu_2026',
        utmSource: customerToEdit.utm?.source || 'facebook',
        utmMedium: customerToEdit.utm?.medium || 'cpc',
        utmCampaign: customerToEdit.utm?.campaign || 'lead_form_kyyeu',
        pipelineStage: (customerToEdit.pipelineStage || 'New Lead') as PipelineStage,
        assignedSalesName: customerToEdit.assignedSalesName || initialSalesName,
        assignedCareStaffName: customerToEdit.assignedCareStaffName || 'Phạm Quỳnh Nga (CSKH)'
      };
    }

    const defaultStudentCount = 35;
    const defaultUnitPrice = 350000;
    const defaultSubtotal = defaultStudentCount * defaultUnitPrice;

    return {
      name: '',
      phone: '',
      email: '',
      facebook: '',
      zalo: '',
      schoolName: schools[0]?.name || 'THPT Chuyên Trần Phú (Hải Phòng)',
      grade: 'Khối 12',
      className: '',
      academicYear: '2025-2026',
      city: 'Hải Phòng',
      district: 'Lê Chân',
      region: 'Lê Chân, Hải Phòng',
      representativeRole: 'Lớp trưởng',
      studentCount: defaultStudentCount,
      serviceType: 'Kỷ yếu Concept',
      servicePackageId: servicePackages[1]?.id || '',
      concept: '',
      expectedShootDate: '',
      shootingLocations: 'Trường học & Nhà Hát Lớn / Bãi biển Đồ Sơn',
      
      // Auto-Pricing Fields
      unitPrice: defaultUnitPrice,
      subtotal: defaultSubtotal,
      extraFee: 0,
      discount: 0,
      totalAmount: defaultSubtotal,
      depositAmount: 0,
      paidAmount: 0,
      remainingAmount: defaultSubtotal,
      expectedBudget: defaultSubtotal,

      // Stage-specific fields
      depositDate: '',
      paymentMethod: 'vietqr',
      shootTime: '07:30',
      shootAddress: '',
      leadPhotographerId: '',
      leadPhotographerName: '',
      videographerId: '',
      assistantPhotographerIds: [] as string[],
      photoNotes: '',
      editorName: '',
      editDeadline: '',
      editProgress: 0,
      deliveredDate: '',
      deliveredDriveUrl: '',
      deliveryMethod: 'drive_link',
      lostReason: '',
      lostNote: '',

      specialRequests: '',
      notes: '',
      source: 'Facebook Ads' as LeadSource,
      campaignName: 'Mùa_Kỷ_Yếu_2026',
      utmSource: 'facebook',
      utmMedium: 'cpc',
      utmCampaign: 'lead_form_kyyeu',
      pipelineStage: 'New Lead' as PipelineStage,
      assignedSalesName: initialSalesName,
      assignedCareStaffName: 'Phạm Quỳnh Nga (CSKH)'
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Tìm booking tương ứng với khách hàng đang sửa (nếu có)
  const currentMatchedBooking = useMemo(() => {
    if (!customerToEdit?.id) return null;
    return bookings.find(
      b => !b.isDeleted && (
        b.customerId === customerToEdit.id ||
        (b.className && b.className === customerToEdit.className && b.schoolName === customerToEdit.schoolName)
      )
    ) || null;
  }, [customerToEdit, bookings]);

  // Tính toán tình trạng lịch bận/rảnh của Thợ chính (Trưởng nháy) - Loại trừ chính đơn đang sửa
  const selectedLeadPhotoAvailability = useMemo(() => {
    if (!formData.leadPhotographerId || !formData.expectedShootDate) {
      return { available: true, totalShootsOnDay: 0 };
    }
    return getPhotographerAvailability(formData.leadPhotographerId, formData.expectedShootDate, {
      excludeBookingId: currentMatchedBooking?.id,
      excludeCustomerId: customerToEdit?.id,
      excludeClassName: formData.className || customerToEdit?.className,
      excludeSchoolName: formData.schoolName || customerToEdit?.schoolName
    });
  }, [
    formData.leadPhotographerId, 
    formData.expectedShootDate, 
    formData.className,
    formData.schoolName,
    customerToEdit, 
    currentMatchedBooking, 
    getPhotographerAvailability
  ]);

  // Tự động làm mới form mỗi khi mở modal hoặc đổi khách hàng cần sửa
  React.useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, customerToEdit]);

  // Realtime recalculate amounts khi số lượng, đơn giá, phụ phí, giảm giá, cọc thay đổi
  const calcSubtotal = (formData.studentCount || 0) * (formData.unitPrice || 0);
  const calcTotalAmount = Math.max(0, calcSubtotal + (formData.extraFee || 0) - (formData.discount || 0));
  const calcPaidAmount = formData.paidAmount !== undefined ? Number(formData.paidAmount) : (Number(formData.depositAmount) || 0);
  const calcRemainingAmount = Math.max(0, calcTotalAmount - calcPaidAmount);

  // Kiểm tra giai đoạn có bắt buộc Số điện thoại và Tên lớp hay không
  const isContactRequired = !STAGES_WITHOUT_REQUIRED_CONTACT.includes(formData.pipelineStage);

  const availableDistricts = getDistrictsByCity(formData.city);

  const handleCityChange = (cityName: string) => {
    const districts = getDistrictsByCity(cityName);
    const firstDistrict = districts[0] || '';
    setFormData(prev => ({
      ...prev,
      city: cityName,
      district: firstDistrict,
      region: firstDistrict ? `${firstDistrict}, ${cityName}` : cityName
    }));
  };

  const handleDistrictChange = (districtName: string) => {
    setFormData(prev => ({
      ...prev,
      district: districtName,
      region: districtName ? `${districtName}, ${prev.city}` : prev.city
    }));
  };

  // Chuẩn hóa số điện thoại để kiểm tra trùng
  const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '');

  const cleanInputPhone = cleanPhone(formData.phone);
  const cleanInputZalo = cleanPhone(formData.zalo);
  const duplicateCustomer = cleanInputPhone.length >= 4
    ? (customers || []).find(c => {
        if (customerToEdit && c.id === customerToEdit.id) return false;
        const cPhone = cleanPhone(c.phone);
        const cZalo = cleanPhone(c.zalo);
        return (cPhone && (cPhone === cleanInputPhone || (cleanInputZalo && cPhone === cleanInputZalo))) ||
               (cZalo && ((cleanInputPhone && cZalo === cleanInputPhone) || (cleanInputZalo && cZalo === cleanInputZalo)));
      })
    : null;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Luôn cần Tên liên hệ hoặc tên nhóm
    if (!formData.name?.trim()) {
      alert('Vui lòng điền ít nhất Tên liên hệ hoặc tên nhóm!');
      return;
    }

    // 2. Kiểm tra điều kiện bắt buộc Số điện thoại & Tên lớp:
    // Theo quy trình kỷ yếu: các giai đoạn trước cọc ("New Lead", "Đang tư vấn", "Đã gửi báo giá", "Lost")
    // KHÔNG BẮT BUỘC số điện thoại & tên lớp (khách có thể chỉ trao đổi qua Facebook/TikTok/Zalo chat).
    // Chỉ BẮT BUỘC Số điện thoại và Tên lớp từ giai đoạn "Đã cọc" (Đã đặt cọc) trở đi để làm hợp đồng và điều phối ekip.
    const stagesWithoutRequiredContact: PipelineStage[] = [
      'New Lead',
      'Đang tư vấn',
      'Đã liên hệ',
      'Đang thương lượng',
      'Đã gửi báo giá',
      'Lost'
    ];
    const isContactRequired = !stagesWithoutRequiredContact.includes(formData.pipelineStage);

    if (isContactRequired && !formData.phone?.trim()) {
      alert('Từ giai đoạn Đã cọc / Lên lịch chụp trở đi, bắt buộc phải có Số điện thoại liên hệ để làm hợp đồng và điều phối ekip!');
      return;
    }

    if (isContactRequired && !formData.className?.trim()) {
      alert('Từ giai đoạn Đã cọc trở đi, vui lòng điền đầy đủ Tên lớp để hoàn tất thông tin đơn chụp!');
      return;
    }

    // 3. Nếu là Lost: bắt buộc nhập lý do từ chối
    if (formData.pipelineStage === 'Lost' && !formData.lostReason.trim()) {
      alert('Vui lòng chọn hoặc nhập Lý do khách từ chối (Lost)!');
      return;
    }

    // Kiểm tra trùng số điện thoại
    const inputCleanPhone = cleanPhone(formData.phone);
    const inputCleanZalo = cleanPhone(formData.zalo);
    if (inputCleanPhone.length >= 4) {
      const directDup = (customers || []).find(c => {
        if (customerToEdit && c.id === customerToEdit.id) return false;
        const cPhone = cleanPhone(c.phone);
        const cZalo = cleanPhone(c.zalo);
        return (cPhone && (cPhone === inputCleanPhone || (inputCleanZalo && cPhone === inputCleanZalo))) ||
               (cZalo && ((inputCleanPhone && cZalo === inputCleanPhone) || (inputCleanZalo && cZalo === inputCleanZalo)));
      });

      if (directDup) {
        alert(
          `⚠️ SỐ ĐIỆN THOẠI ĐÃ BỊ TRÙNG!\n\n` +
          `Số điện thoại "${formData.phone}" đã tồn tại trên hệ thống với thông tin:\n` +
          `• Khách hàng: ${directDup.name}\n` +
          `• Lớp / Trường: ${directDup.className} - ${directDup.schoolName}\n` +
          `• Sales phụ trách: ${directDup.assignedSalesName || 'Chưa gán'}\n` +
          `• Trạng thái: ${directDup.pipelineStage}\n\n` +
          `Hệ thống từ chối lưu để tránh trùng lặp dữ liệu CRM!`
        );
        return;
      }
    }

    const selectedPkg = servicePackages.find(p => p.id === formData.servicePackageId);

    let salesName = formData.assignedSalesName;
    if ((!salesName || salesName === 'Chưa gán') && currentUser.role === 'sales') {
      salesName = currentUser.name;
    } else if (formData.pipelineStage !== 'New Lead' && salesName === 'Chưa gán') {
      salesName = currentUser.role === 'sales' ? currentUser.name : (salesStaff[0]?.name || '');
    }
    const matchedSales = salesStaff.find(s => s.name === salesName);
    const salesId = matchedSales?.id || (salesName === currentUser.name ? currentUser.id : '');

    // Thông tin Ekip Thợ Chụp (CSDL CRM Thực Tế)
    const leadPhoto = photographers.find(p => p.id === formData.leadPhotographerId);
    const leadName = leadPhoto?.fullName || formData.leadPhotographerName || '';
    const videoPhoto = photographers.find(p => p.id === formData.videographerId);
    const videoName = videoPhoto?.fullName || '';
    const assistantNames = (formData.assistantPhotographerIds || [])
      .map(id => photographers.find(p => p.id === id)?.fullName)
      .filter(Boolean) as string[];

    let updatedNotes = formData.notes || '';
    if (leadName) {
      if (updatedNotes.includes('Thợ chụp:')) {
        updatedNotes = updatedNotes.replace(/Thợ chụp:[^.\n]*\.?/gi, `Thợ chụp: ${leadName}.`);
      } else {
        updatedNotes = `${updatedNotes ? updatedNotes + '\n' : ''}Thợ chụp: ${leadName}.`.trim();
      }
    }

    // Nếu đang ở chế độ CHỈNH SỬA khách hàng đã có
    if (customerToEdit) {
      updateCustomer({
        ...customerToEdit,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        facebook: formData.facebook,
        zalo: formData.zalo || formData.phone,
        schoolName: formData.schoolName,
        grade: formData.grade,
        className: formData.className,
        academicYear: formData.academicYear,
        city: formData.city,
        district: formData.district,
        region: formData.region || (formData.district ? `${formData.district}, ${formData.city}` : formData.city),
        representativeRole: formData.representativeRole,
        studentCount: Number(formData.studentCount) || 35,
        serviceType: formData.serviceType,
        servicePackageId: formData.servicePackageId,
        servicePackageName: selectedPkg?.name || customerToEdit.servicePackageName || 'Gói Tùy Chọn',
        concept: formData.concept,
        expectedShootDate: formData.expectedShootDate,
        shootingLocations: formData.shootingLocations.split(',').map((s: string) => s.trim()).filter(Boolean),
        
        // Auto-Pricing calculated fields
        unitPrice: formData.unitPrice !== undefined ? Number(formData.unitPrice) : 0,
        subtotal: calcSubtotal,
        extraFee: Number(formData.extraFee) || 0,
        discount: Number(formData.discount) || 0,
        totalAmount: calcTotalAmount,
        depositAmount: Number(formData.depositAmount) || 0,
        paidAmount: formData.paidAmount !== undefined ? Number(formData.paidAmount) : (Number(formData.depositAmount) || (customerToEdit.paidAmount || 0)),
        remainingAmount: calcRemainingAmount,

        // Stage-specific fields
        depositDate: formData.depositDate,
        paymentMethod: formData.paymentMethod,
        shootTime: formData.shootTime,
        shootAddress: formData.shootAddress,
        leadPhotographerId: formData.leadPhotographerId || undefined,
        leadPhotographerName: leadName || undefined,
        videographerId: formData.videographerId || undefined,
        videographerName: videoName || undefined,
        assistantPhotographerIds: formData.assistantPhotographerIds,
        assistantNames: assistantNames,
        photoNotes: formData.photoNotes,
        editorName: formData.editorName,
        editDeadline: formData.editDeadline,
        editProgress: Number(formData.editProgress) || 0,
        deliveredDate: formData.deliveredDate,
        deliveredDriveUrl: formData.deliveredDriveUrl,
        deliveryMethod: formData.deliveryMethod,
        lostReason: formData.lostReason,
        lostNote: formData.lostNote,

        specialRequests: formData.specialRequests,
        notes: updatedNotes,
        source: formData.source,
        campaignName: formData.campaignName,
        utm: {
          source: formData.utmSource,
          medium: formData.utmMedium,
          campaign: formData.utmCampaign
        },
        pipelineStage: formData.pipelineStage,
        assignedSalesId: salesId,
        assignedSalesName: salesName,
        assignedCareStaffName: formData.assignedCareStaffName
      });

      // Đồng bộ / Tạo Booking để thợ chụp nhìn thấy trong tài khoản cá nhân
      const matchedBooking = bookings.find(
        b => b.customerId === customerToEdit.id ||
        (b.className && b.className === formData.className && b.schoolName === formData.schoolName)
      );

      const bookingAssignments = {
        leadPhotographerId: formData.leadPhotographerId || undefined,
        leadPhotographerName: leadName || undefined,
        videographerId: formData.videographerId || undefined,
        videographerName: videoName || undefined,
        assistantPhotographerIds: formData.assistantPhotographerIds,
        assistantNames: assistantNames
      };

      if (matchedBooking) {
        updateBooking({
          ...matchedBooking,
          customerName: formData.name,
          schoolName: formData.schoolName,
          className: formData.className,
          shootDate: formData.expectedShootDate || matchedBooking.shootDate,
          startTime: formData.shootTime || matchedBooking.startTime || '07:30',
          location: formData.shootAddress || formData.shootingLocations || matchedBooking.location,
          totalAmount: calcTotalAmount,
          depositAmount: Number(formData.depositAmount) || 0,
          remainingAmount: calcRemainingAmount,
          assignments: {
            ...matchedBooking.assignments,
            ...bookingAssignments
          },
          notes: formData.photoNotes || matchedBooking.notes,
          photoNotes: formData.photoNotes || matchedBooking.photoNotes,
          updatedAt: new Date().toISOString()
        });
      } else if (formData.leadPhotographerId || formData.expectedShootDate || formData.pipelineStage === 'Book ngày') {
        addBooking({
          code: `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${formData.className || 'CLASS'}`,
          customerId: customerToEdit.id,
          customerName: formData.name,
          schoolName: formData.schoolName || '',
          className: formData.className || '',
          shootDate: formData.expectedShootDate || new Date().toISOString().split('T')[0],
          startTime: formData.shootTime || '07:30',
          endTime: '17:30',
          location: formData.shootAddress || formData.schoolName || 'Studio Xoăn Media',
          city: formData.city || 'Hải Phòng',
          district: formData.district || '',
          studentCount: Number(formData.studentCount) || 35,
          packageId: formData.servicePackageId || 'pkg-2',
          packageName: selectedPkg?.name || customerToEdit.servicePackageName || 'Gói Tùy Chọn',
          concept: formData.concept || 'Tùy chọn',
          totalAmount: calcTotalAmount,
          depositAmount: Number(formData.depositAmount) || 0,
          remainingAmount: calcRemainingAmount,
          paymentStatus: Number(formData.depositAmount) > 0 ? 'Đã cọc' : 'Chưa cọc',
          bookingStatus: 'Đã xác nhận',
          assignments: bookingAssignments,
          notes: formData.photoNotes || (leadName ? `Trưởng nháy: ${leadName}` : ''),
          photoNotes: formData.photoNotes || ''
        });
      }

      if (formData.leadPhotographerId && leadName) {
        addActivityLog({
          customerId: customerToEdit.id,
          type: 'photographer_assigned',
          title: `Phân công Trưởng nháy: ${leadName}`,
          description: `Phân công Trưởng nháy: ${leadName} cho lớp ${formData.className || ''} - ${formData.schoolName || ''} ngày ${formData.expectedShootDate || ''}`,
          performedByName: currentUser.name
        });
      }

      onClose();
      return;
    }

    // Chế độ TẠO MỚI khách hàng
    const newCustId = `cust-${Date.now()}`;
    const success = addCustomer({
      id: newCustId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      facebook: formData.facebook,
      zalo: formData.zalo || formData.phone,
      schoolName: formData.schoolName,
      grade: formData.grade,
      className: formData.className,
      academicYear: formData.academicYear,
      city: formData.city,
      district: formData.district,
      region: formData.region || (formData.district ? `${formData.district}, ${formData.city}` : formData.city),
      representativeRole: formData.representativeRole,
      studentCount: Number(formData.studentCount) || 35,
      serviceType: formData.serviceType,
      servicePackageId: formData.servicePackageId,
      servicePackageName: selectedPkg?.name || 'Gói Tùy Chọn',
      concept: formData.concept,
      expectedShootDate: formData.expectedShootDate,
      shootingLocations: formData.shootingLocations.split(',').map((s: string) => s.trim()).filter(Boolean),
      
      // Auto-Pricing calculated fields
      unitPrice: formData.unitPrice !== undefined ? Number(formData.unitPrice) : 350000,
      subtotal: calcSubtotal,
      extraFee: Number(formData.extraFee) || 0,
      discount: Number(formData.discount) || 0,
      totalAmount: calcTotalAmount,
      depositAmount: Number(formData.depositAmount) || 0,
      paidAmount: formData.paidAmount !== undefined ? Number(formData.paidAmount) : (Number(formData.depositAmount) || 0),
      remainingAmount: calcRemainingAmount,
      expectedBudget: calcTotalAmount,

      // Stage-specific fields
      depositDate: formData.depositDate,
      paymentMethod: formData.paymentMethod,
      shootTime: formData.shootTime,
      shootAddress: formData.shootAddress,
      leadPhotographerId: formData.leadPhotographerId || undefined,
      leadPhotographerName: leadName || undefined,
      videographerId: formData.videographerId || undefined,
      videographerName: videoName || undefined,
      assistantPhotographerIds: formData.assistantPhotographerIds,
      assistantNames: assistantNames,
      photoNotes: formData.photoNotes,
      editorName: formData.editorName,
      editDeadline: formData.editDeadline,
      editProgress: Number(formData.editProgress) || 0,
      deliveredDate: formData.deliveredDate,
      deliveredDriveUrl: formData.deliveredDriveUrl,
      deliveryMethod: formData.deliveryMethod,
      lostReason: formData.lostReason,
      lostNote: formData.lostNote,

      specialRequests: formData.specialRequests,
      notes: updatedNotes,
      source: formData.source,
      campaignName: formData.campaignName,
      utm: {
        source: formData.utmSource,
        medium: formData.utmMedium,
        campaign: formData.utmCampaign
      },
      pipelineStage: formData.pipelineStage,
      assignedSalesId: salesId,
      assignedSalesName: salesName,
      assignedCareStaffName: formData.assignedCareStaffName,
      createdById: currentUser.id,
      createdByName: currentUser.name
    } as any);

    if (success && (formData.leadPhotographerId || formData.expectedShootDate || formData.pipelineStage === 'Book ngày')) {
      addBooking({
        code: `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${formData.className || 'CLASS'}`,
        customerId: newCustId,
        customerName: formData.name,
        schoolName: formData.schoolName || '',
        className: formData.className || '',
        shootDate: formData.expectedShootDate || new Date().toISOString().split('T')[0],
        startTime: formData.shootTime || '07:30',
        endTime: '17:30',
        location: formData.shootAddress || formData.schoolName || 'Studio Xoăn Media',
        city: formData.city || 'Hải Phòng',
        district: formData.district || '',
        studentCount: Number(formData.studentCount) || 35,
        packageId: formData.servicePackageId || 'pkg-2',
        packageName: selectedPkg?.name || 'Gói Tùy Chọn',
        concept: formData.concept || 'Tùy chọn',
        totalAmount: calcTotalAmount,
        depositAmount: Number(formData.depositAmount) || 0,
        remainingAmount: calcRemainingAmount,
        paymentStatus: Number(formData.depositAmount) > 0 ? 'Đã cọc' : 'Chưa cọc',
        bookingStatus: 'Đã xác nhận',
        assignments: {
          leadPhotographerId: formData.leadPhotographerId || undefined,
          leadPhotographerName: leadName || undefined,
          videographerId: formData.videographerId || undefined,
          videographerName: videoName || undefined,
          assistantPhotographerIds: formData.assistantPhotographerIds || [],
          assistantNames: assistantNames
        },
        notes: formData.photoNotes || (leadName ? `Trưởng nháy: ${leadName}` : ''),
        photoNotes: formData.photoNotes || ''
      });

      if (formData.leadPhotographerId && leadName) {
        addActivityLog({
          customerId: newCustId,
          type: 'photographer_assigned',
          title: `Phân công Trưởng nháy: ${leadName}`,
          description: `Phân công Trưởng nháy: ${leadName} cho lớp ${formData.className || ''} - ${formData.schoolName || ''} ngày ${formData.expectedShootDate || ''}`,
          performedByName: currentUser.name
        });
      }
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-4 text-neutral-900">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-900">
                {customerToEdit ? `Chỉnh Sửa Hồ Sơ Lead: ${customerToEdit.name}` : 'Nhập Mới Lead Kỷ Yếu & Tính Giá Tự Động'}
              </h2>
              <p className="text-[11px] text-neutral-500">
                Chuẩn hóa 10 giai đoạn Pipeline, Auto-Pricing Engine & trường đặc thù từng bước.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto text-xs custom-scrollbar">
          
          {/* SECTION 1: NGƯỜI ĐẠI DIỆN & LIÊN HỆ */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <User className="w-4 h-4 text-neutral-700" /> 1. Thông Tin Người Đại Diện & Liên Hệ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Họ & Tên khách / Đại diện *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Vũ Thùy Linh (Lớp trưởng)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-700">
                    Số điện thoại
                    {isContactRequired ? (
                      <span className="text-rose-500 font-bold"> * (bắt buộc khi chốt cọc)</span>
                    ) : (
                      <span className="ml-1 text-neutral-400 font-normal text-xs">(tùy chọn)</span>
                    )}
                  </label>
                  {duplicateCustomer && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                      Trùng SĐT
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="0912..."
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 bg-neutral-50 border text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    duplicateCustomer
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900 font-medium'
                      : 'border-black/[0.08] focus:ring-[#B8F23D]'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Vai trò đại diện</label>
                <select
                  value={formData.representativeRole}
                  onChange={e => setFormData({ ...formData, representativeRole: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Lớp trưởng">Lớp trưởng</option>
                  <option value="Bí thư">Bí thư chi đoàn</option>
                  <option value="Trưởng ban Kỷ yếu">Trưởng ban Kỷ yếu</option>
                  <option value="Hội phụ huynh">Hội phụ huynh học sinh</option>
                  <option value="Giáo viên chủ nhiệm">Giáo viên chủ nhiệm</option>
                  <option value="Thành viên trong lớp">Thành viên trong lớp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Link Facebook / Messenger</label>
                <input
                  type="text"
                  placeholder="fb.com/thuy.linh..."
                  value={formData.facebook}
                  onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Số Zalo liên hệ</label>
                <input
                  type="text"
                  placeholder="0912... (để trống lấy theo SĐT)"
                  value={formData.zalo}
                  onChange={e => setFormData({ ...formData, zalo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Email (Gửi hợp đồng/ảnh)</label>
                <input
                  type="email"
                  placeholder="lop12a1@gmail.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: THÔNG TIN TRƯỜNG & LỚP */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <School className="w-4 h-4 text-neutral-700" /> 2. Trường Học, Lớp & Địa Điểm
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Trường học</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="THPT Chuyên Trần Phú..."
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">
                  Tên lớp
                  {isContactRequired ? (
                    <span className="text-rose-500 font-bold"> * (bắt buộc khi chốt cọc)</span>
                  ) : (
                    <span className="ml-1 text-neutral-400 font-normal text-xs">(tùy chọn)</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="VD: 12A1 Lý, 12 Tin..."
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Số lượng học sinh *</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={formData.studentCount}
                  onChange={e => setFormData({ ...formData, studentCount: Number(e.target.value) || 1 })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Khối lớp</label>
                <select
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Khối 12">Khối 12 (THPT ra trường)</option>
                  <option value="Khối 9">Khối 9 (THCS lên cấp 3)</option>
                  <option value="Khối 5">Khối 5 (Tiểu học)</option>
                  <option value="Đại học">Đại học năm cuối</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Niên khóa</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  Tỉnh / Thành phố
                </label>
                <select
                  value={formData.city}
                  onChange={e => handleCityChange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  {VIETNAM_LOCATIONS.map(loc => (
                    <option key={loc.city} value={loc.city}>
                      {loc.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Quận / Huyện</label>
                <select
                  value={formData.district}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  {availableDistricts.map(dist => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: AUTO-PRICING ENGINE & TÍNH GIÁ TỰ ĐỘNG */}
          <div className="space-y-3 bg-[#F8FAF3] border border-[#B8F23D]/50 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <h3 className="font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2 text-xs">
                <Calculator className="w-4 h-4 text-neutral-900" />
                3. Bảng Tính Giá Tự Động (Auto-Pricing Engine)
              </h3>
              <span className="text-[10px] font-bold text-neutral-800 bg-[#B8F23D] px-2 py-0.5 rounded-full">
                Real-time Calculator
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Gói Kỷ Yếu</label>
                <select
                  value={formData.servicePackageId}
                  onChange={e => {
                    const pkgId = e.target.value;
                    const pkg = servicePackages.find(p => p.id === pkgId);
                    const newUnitPrice = pkg?.price || 350000;
                    setFormData({
                      ...formData,
                      servicePackageId: pkgId,
                      unitPrice: newUnitPrice
                    });
                  }}
                  className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  {servicePackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.price.toLocaleString('vi-VN')}đ/bạn)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-800 text-xs flex items-center justify-between">
                  <span>Giá của 1 học sinh (đ/bạn) *</span>
                  <span className="text-[10px] text-neutral-500 font-normal">0đ nếu miễn phí</span>
                </label>
                <input
                  type="text"
                  placeholder="0 (VD: 350.000)"
                  value={formData.unitPrice ? formData.unitPrice.toLocaleString('vi-VN') : (formData.unitPrice === 0 ? '0' : '')}
                  onChange={e => {
                    const raw = e.target.value;
                    if (raw === '' || raw === '0') {
                      setFormData({ ...formData, unitPrice: 0 });
                    } else {
                      setFormData({ ...formData, unitPrice: parseMoneyInput(raw) });
                    }
                  }}
                  className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.12] font-bold text-neutral-950 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Phụ phí phát sinh (đ)</label>
                <input
                  type="text"
                  placeholder="0 (Flycam, xe...)"
                  value={formData.extraFee ? formData.extraFee.toLocaleString('vi-VN') : ''}
                  onChange={e => setFormData({ ...formData, extraFee: parseMoneyInput(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Chiết khấu / Giảm giá (đ)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={formData.discount ? formData.discount.toLocaleString('vi-VN') : ''}
                  onChange={e => setFormData({ ...formData, discount: parseMoneyInput(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* LIVE PRICING PREVIEW CARD */}
            <div className="bg-white rounded-xl p-3 border border-black/[0.06] shadow-2xs space-y-2 mt-2">
              <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
                <div>
                  Công thức: <strong>{formData.studentCount || 0} bạn</strong> × <strong>{(formData.unitPrice || 0).toLocaleString('vi-VN')} đ</strong> = Tạm tính: <strong className="text-neutral-900">{calcSubtotal.toLocaleString('vi-VN')} đ</strong>
                </div>
                {formData.extraFee > 0 && (
                  <span className="text-amber-700 font-semibold">+ Phụ phí: {formData.extraFee.toLocaleString('vi-VN')} đ</span>
                )}
                {formData.discount > 0 && (
                  <span className="text-rose-600 font-semibold">- Giảm giá: {formData.discount.toLocaleString('vi-VN')} đ</span>
                )}
              </div>

              <div className="pt-3 border-t border-black/[0.04] space-y-3">
                {/* 1. Tổng đơn hàng & Trạng thái thanh toán */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-neutral-50 rounded-xl border border-black/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Tổng Đơn Hàng:</span>
                    <span className="text-base font-black text-neutral-950 font-mono">
                      {calcTotalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {calcTotalAmount > 0 && calcRemainingAmount === 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã tất toán đủ 100%
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-neutral-500 font-medium">Công nợ còn lại:</span>
                        <span className="font-extrabold text-rose-600 font-mono text-sm">
                          {calcRemainingAmount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Tiền Cọc Giữ Lịch */}
                <div className="space-y-1.5 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-emerald-950 font-bold">1. Tiền Cọc Giữ Lịch:</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0"
                        value={formData.depositAmount !== undefined && formData.depositAmount !== null && formData.depositAmount > 0 ? formData.depositAmount.toLocaleString('vi-VN') : (formData.depositAmount === 0 ? '0' : '')}
                        onChange={e => {
                          const newDeposit = parseMoneyInput(e.target.value);
                          const prevDeposit = Number(formData.depositAmount) || 0;
                          const currentPaid = formData.paidAmount !== undefined ? Number(formData.paidAmount) : prevDeposit;
                          const shouldSyncPaid = currentPaid === 0 || currentPaid === prevDeposit;
                          setFormData({
                            ...formData,
                            depositAmount: newDeposit,
                            paidAmount: shouldSyncPaid ? newDeposit : currentPaid
                          });
                        }}
                        className="w-36 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-black text-emerald-950 focus:bg-white focus:outline-none font-mono"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-bold pointer-events-none">
                        đ
                      </span>
                    </div>
                  </div>

                  {/* Phím chọn nhanh mức cọc kỷ yếu */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                    <span className="text-neutral-400 font-medium text-[10px]">Gợi ý cọc:</span>
                    {[
                      { label: '0 đ', val: 0 },
                      { label: '1 Triệu', val: 1000000 },
                      { label: '2 Triệu (Chuẩn)', val: 2000000 },
                      { label: '3 Triệu', val: 3000000 },
                      { label: '5 Triệu', val: 5000000 },
                      ...(calcTotalAmount > 0 ? [
                        { label: '20%', val: Math.round((calcTotalAmount * 0.2) / 10000) * 10000 },
                        { label: '30%', val: Math.round((calcTotalAmount * 0.3) / 10000) * 10000 },
                        { label: '50%', val: Math.round((calcTotalAmount * 0.5) / 10000) * 10000 }
                      ] : [])
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const prevDeposit = Number(formData.depositAmount) || 0;
                          const currentPaid = formData.paidAmount !== undefined ? Number(formData.paidAmount) : prevDeposit;
                          const shouldSyncPaid = currentPaid === 0 || currentPaid === prevDeposit;
                          setFormData({
                            ...formData,
                            depositAmount: chip.val,
                            paidAmount: shouldSyncPaid ? chip.val : currentPaid
                          });
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          formData.depositAmount === chip.val
                            ? 'bg-emerald-900 text-[#B8F23D] shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Thực Thu Đã Nhận (Cọc + Các Đợt / Tất Toán) */}
                <div className="space-y-1.5 p-2.5 bg-blue-50/50 rounded-xl border border-blue-200/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Wallet className="w-3.5 h-3.5 text-blue-700" />
                      <span className="text-blue-950 font-bold">2. Thực Thu Đã Nhận (Cọc + Đợt 2 + Tất toán):</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0"
                        value={formData.paidAmount !== undefined && formData.paidAmount !== null && formData.paidAmount > 0 ? formData.paidAmount.toLocaleString('vi-VN') : (formData.paidAmount === 0 ? '0' : '')}
                        onChange={e => setFormData({ ...formData, paidAmount: parseMoneyInput(e.target.value) })}
                        className="w-36 px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-black text-blue-950 focus:bg-white focus:outline-none font-mono"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-bold pointer-events-none">
                        đ
                      </span>
                    </div>
                  </div>

                  {/* Nút chọn nhanh Thực Thu */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                    <span className="text-neutral-400 font-medium text-[10px]">Cập nhật nhanh thực thu:</span>
                    {[
                      { label: 'Bằng tiền cọc', val: Number(formData.depositAmount) || 0 },
                      ...(calcTotalAmount > 0 ? [
                        { label: '50% đơn', val: Math.round((calcTotalAmount * 0.5) / 10000) * 10000 },
                        { label: '70% đơn', val: Math.round((calcTotalAmount * 0.7) / 10000) * 10000 },
                        { label: 'Tất toán 100%', val: calcTotalAmount }
                      ] : [])
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, paidAmount: chip.val })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          calcPaidAmount === chip.val && chip.val > 0
                            ? 'bg-blue-900 text-white shadow-2xs'
                            : 'bg-white hover:bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                    {calcPaidAmount > 0 && calcTotalAmount > 0 && (
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full ml-auto">
                        Đã thu {Math.min(100, Math.round((calcPaidAmount / calcTotalAmount) * 100))}% đơn
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: GIAI ĐOẠN PIPELINE & CÁC TRƯỜNG ĐẶC THÙ (STAGE-SPECIFIC FIELDS) */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <Layers className="w-4 h-4 text-indigo-600" /> 4. Giai Đoạn Pipeline (Chuẩn Hóa 10 Bước) & Trường Bổ Trợ
            </h3>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Giai đoạn hiện tại trên Pipeline *
              </label>
              <select
                value={formData.pipelineStage}
                onChange={e => {
                  const newStage = e.target.value as PipelineStage;
                  if (newStage === 'Hoàn thành') {
                    const hasShotOrDelivered = ['Đã chụp', 'Đang hậu kỳ', 'Giao ảnh', 'Đã bàn giao'].includes(formData.pipelineStage) || Boolean(customerToEdit?.shotDate);
                    if (!hasShotOrDelivered) {
                      alert('⚠️ Lớp này chưa chụp kỷ yếu (chưa qua giai đoạn Đã chụp/Giao ảnh) nên chưa thể chuyển sang "Hoàn thành" được!\n\nNếu lớp đã thu đủ 100% tiền nhưng chưa chụp, vui lòng giữ ở giai đoạn "Đã cọc" hoặc "Book ngày".');
                      return;
                    }
                    if (calcTotalAmount > 0 && (Number(formData.paidAmount || 0) < calcTotalAmount)) {
                      setFormData({ ...formData, pipelineStage: newStage, paidAmount: calcTotalAmount });
                      return;
                    }
                  }
                  setFormData({ ...formData, pipelineStage: newStage });
                }}
                className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 font-bold rounded-xl cursor-pointer focus:bg-white focus:outline-none"
              >
                <option value="New Lead">1. New Lead (Mới tiếp nhận)</option>
                <option value="Đang tư vấn">2. Đang tư vấn concept</option>
                <option value="Đã gửi báo giá">3. Đã gửi báo giá</option>
                <option value="Đã cọc">4. Đã cọc (Đã chốt cọc)</option>
                <option value="Book ngày">5. Book ngày (Đã lên lịch chụp)</option>
                <option value="Đã chụp">6. Đã chụp (Chờ nộp link Drive)</option>
                <option value="Đang hậu kỳ">7. Đang hậu kỳ (Photoshop & Video)</option>
                <option value="Giao ảnh">8. Giao ảnh (Bàn giao hoàn thiện)</option>
                <option value="Hoàn thành">9. Hoàn thành (Quyết toán 100%)</option>
                <option value="Lost">10. Khách từ chối (Lost)</option>
              </select>
            </div>

            {/* TRƯỜNG ĐẶC THÙ THEO GIAI ĐOẠN (CONDITIONAL FIELDS) */}
            
            {/* 1. Nếu ở giai đoạn: ĐÃ CỌC */}
            {formData.pipelineStage === 'Đã cọc' && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Thông Tin Xác Nhận Đặt Cọc
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700">Ngày đặt cọc</label>
                    <input
                      type="date"
                      value={formData.depositDate}
                      onChange={e => setFormData({ ...formData, depositDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700">Hình thức thanh toán</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none"
                    >
                      <option value="vietqr">VietQR (Mã QR Tự Động)</option>
                      <option value="transfer">Chuyển khoản ngân hàng</option>
                      <option value="cash">Tiền mặt tại Studio</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Nếu ở giai đoạn: BOOK NGÀY */}
            {formData.pipelineStage === 'Book ngày' && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3.5 animate-in fade-in duration-150 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-purple-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <Calendar className="w-4 h-4 text-purple-600" /> Thông Tin Lịch Chụp & Ekip (Lên Booking)
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                    Đồng bộ tự động vào tài khoản Thợ
                  </span>
                </div>

                {/* Hàng 1: Thời gian & Địa điểm */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700">Ngày chụp chính thức *</label>
                    <input
                      type="date"
                      value={formData.expectedShootDate}
                      onChange={e => setFormData({ ...formData, expectedShootDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700">Giờ tập trung bấm máy</label>
                    <input
                      type="time"
                      value={formData.shootTime}
                      onChange={e => setFormData({ ...formData, shootTime: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700">Địa chỉ / Lịch trình chụp</label>
                    <input
                      type="text"
                      placeholder="Trường -> Phim trường Wonderland..."
                      value={formData.shootAddress}
                      onChange={e => setFormData({ ...formData, shootAddress: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Hàng 2: Chọn Thợ Chụp & Quay Phim từ CSDL CRM */}
                <div className="pt-2 border-t border-purple-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      Phân Công Ekip Chụp (Dữ liệu Thợ thực tế trong CSDL CRM)
                    </div>
                    <span className="text-[10px] text-neutral-500 italic">
                      {photographers.length} thợ có trong hệ thống
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* 1. Chọn Trưởng nháy (Thợ chụp chính) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-neutral-700 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                          Trưởng nháy (Chụp chính) *
                        </label>
                        {formData.leadPhotographerId && formData.expectedShootDate && (
                          selectedLeadPhotoAvailability.available ? (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Trống lịch
                            </span>
                          ) : (
                            <span 
                              className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5"
                              title={`Trùng với đơn khác: ${selectedLeadPhotoAvailability.conflictDetails || selectedLeadPhotoAvailability.conflictBookingCode || ''}`}
                            >
                              <AlertTriangle className="w-3 h-3" /> Đã có {selectedLeadPhotoAvailability.totalShootsOnDay} ca khác
                            </span>
                          )
                        )}
                      </div>
                      <select
                        value={formData.leadPhotographerId}
                        onChange={e => {
                          const selectedId = e.target.value;
                          const photo = photographers.find(p => p.id === selectedId);
                          // Tự động gỡ khỏi danh sách thợ phụ nếu trước đó đang làm thợ phụ của lớp này
                          const currentAssistants = formData.assistantPhotographerIds || [];
                          const updatedAssistants = currentAssistants.filter(id => id !== selectedId);
                          setFormData({
                            ...formData,
                            leadPhotographerId: selectedId,
                            leadPhotographerName: photo ? photo.fullName : '',
                            assistantPhotographerIds: updatedAssistants
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                      >
                        <option value="">-- Chọn Thợ chụp chính từ CRM --</option>
                        {photographers.map(p => {
                          const isBusy = formData.expectedShootDate
                            ? !getPhotographerAvailability(p.id, formData.expectedShootDate, {
                                excludeBookingId: currentMatchedBooking?.id,
                                excludeCustomerId: customerToEdit?.id,
                                excludeClassName: formData.className || customerToEdit?.className,
                                excludeSchoolName: formData.schoolName || customerToEdit?.schoolName
                              }).available
                            : false;
                          return (
                            <option key={p.id} value={p.id}>
                              {p.fullName} • {p.photographerType} {p.phone ? `(${p.phone})` : ''} {isBusy ? '⚠️ [Trùng lịch đơn khác]' : ''}
                            </option>
                          );
                        })}
                      </select>
                      {formData.leadPhotographerId && (
                        <p className="mt-1 text-[11px] text-purple-700 font-medium">
                          ✓ Lịch chụp sẽ hiển thị trong tài khoản của: <strong>{photographers.find(p => p.id === formData.leadPhotographerId)?.fullName}</strong>
                        </p>
                      )}
                    </div>

                    {/* 2. Chọn Thợ quay phim (Videographer) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-neutral-700 flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-purple-600" />
                          Thợ quay phim (Videographer)
                        </label>
                        <span className="text-[10px] text-neutral-400">Tùy chọn</span>
                      </div>
                      <select
                        value={formData.videographerId}
                        onChange={e => setFormData({ ...formData, videographerId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="">-- Không có thợ quay / Chưa gán --</option>
                        {photographers.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} • {p.photographerType} {p.phone ? `(${p.phone})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. Chọn Thợ phụ (Assistants) - Dạng chip danh sách từ CRM */}
                  <div className="text-xs">
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Thợ phụ / Trợ lý Ekip (Assistants):
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-purple-200 rounded-xl min-h-[38px] items-center">
                      {photographers.map(p => {
                        const isSelected = formData.assistantPhotographerIds?.includes(p.id);
                        const isLead = formData.leadPhotographerId === p.id;
                        return (
                          <button
                            type="button"
                            key={p.id}
                            disabled={isLead}
                            onClick={() => {
                              const current = formData.assistantPhotographerIds || [];
                              const next = isSelected
                                ? current.filter(id => id !== p.id)
                                : [...current, p.id];
                              setFormData({ ...formData, assistantPhotographerIds: next });
                            }}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 cursor-pointer ${
                              isLead
                                ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200'
                                : isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-purple-100/60 hover:border-purple-300'
                            }`}
                            title={isLead ? 'Đang được chọn làm Trưởng nháy' : ''}
                          >
                            <span>{p.fullName}</span>
                            {isSelected && <span className="text-[10px] font-bold">✕</span>}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1 text-[10px] text-neutral-500">
                      Bấm vào tên để chọn hoặc bỏ chọn thợ phụ tham gia hỗ trợ ca chụp.
                    </p>
                  </div>

                  {/* 4. Dặn dò & Ghi chú Ekip */}
                  <div className="text-xs">
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Dặn dò & Ghi chú cho Ekip chụp
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Mang flycam, tập trung trước 30 phút tại cổng trường, mang hắt sáng..."
                      value={formData.photoNotes}
                      onChange={e => setFormData({ ...formData, photoNotes: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Nếu ở giai đoạn: ĐANG HẬU KỲ */}
            {formData.pipelineStage === 'Đang hậu kỳ' && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" /> Tiến Độ & Nhân Sự Hậu Kỳ
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700">Editor phụ trách</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Tuấn Hưng (Lead Editor)"
                      value={formData.editorName}
                      onChange={e => setFormData({ ...formData, editorName: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700">Hạn chót trả ảnh (Deadline)</label>
                    <input
                      type="date"
                      value={formData.editDeadline}
                      onChange={e => setFormData({ ...formData, editDeadline: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700">Tiến độ ({formData.editProgress}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formData.editProgress}
                      onChange={e => setFormData({ ...formData, editProgress: Number(e.target.value) })}
                      className="w-full mt-2 accent-amber-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Nếu ở giai đoạn: GIAO ẢNH */}
            {formData.pipelineStage === 'Giao ảnh' && (
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <FolderOpen className="w-4 h-4 text-teal-600" /> Bàn Giao Sản Phẩm & Link Drive Hoàn Thiện
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700">Ngày bàn giao</label>
                    <input
                      type="date"
                      value={formData.deliveredDate}
                      onChange={e => setFormData({ ...formData, deliveredDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-neutral-700">Link Google Drive Hoàn Thiện *</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={formData.deliveredDriveUrl}
                      onChange={e => setFormData({ ...formData, deliveredDriveUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Nếu ở giai đoạn: LOST */}
            {formData.pipelineStage === 'Lost' && (
              <div className="p-3.5 bg-rose-50/80 border border-rose-300 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                  <UserX className="w-4 h-4 text-rose-600" /> Lý Do Khách Hàng Từ Chối / Dừng Tư Vấn (Lost)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700">Lý do chính *</label>
                    <select
                      value={formData.lostReason}
                      onChange={e => setFormData({ ...formData, lostReason: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-rose-300 rounded-xl text-neutral-900 focus:outline-none"
                    >
                      <option value="">-- Chọn lý do từ chối --</option>
                      <option value="Giá cao so với ngân sách lớp">Giá cao so với ngân sách lớp</option>
                      <option value="Đã chọn Studio đối thủ khác">Đã chọn Studio đối thủ khác</option>
                      <option value="Lớp không thống nhất được ý kiến">Lớp không thống nhất được ý kiến</option>
                      <option value="Trùng lịch thi / Hoãn kế hoạch chụp">Trùng lịch thi / Hoãn kế hoạch chụp</option>
                      <option value="Khoảng cách địa lý xa">Khoảng cách địa lý xa</option>
                      <option value="Không liên lạc được / Thuê bao">Không liên lạc được / Thuê bao</option>
                      <option value="Khác">Lý do khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700">Ghi chú chi tiết lý do</label>
                    <input
                      type="text"
                      placeholder="Ghi chú thêm về phản hồi của học sinh..."
                      value={formData.lostNote}
                      onChange={e => setFormData({ ...formData, lostNote: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white border border-rose-300 rounded-xl text-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: PHÂN BỔ NHÂN SỰ & MARKETING */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <Tag className="w-4 h-4 text-emerald-600" /> 5. Nguồn Tiếp Cận & Phân Bổ Nhân Sự Sales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Kênh nguồn marketing *</label>
                <select
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Facebook Organic">Facebook Organic</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="TikTok">TikTok Tự Nhiên</option>
                  <option value="Zalo">Zalo OA / Chatbot</option>
                  <option value="Website">Website Form</option>
                  <option value="Google">Google Search</option>
                  <option value="Referral">Học sinh / Thợ giới thiệu</option>
                  <option value="Khách hàng cũ">Khách hàng cũ quay lại</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 flex items-center justify-between">
                  <span>Sales Tư Vấn Phụ Trách</span>
                  {isSalesStaffUser && !isLead && (
                    <span className="text-[10px] text-neutral-400 font-normal">Tự động gắn tài khoản của bạn</span>
                  )}
                  {isLead && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md">Quyền Sales Lead: Gán cho mình hoặc cấp dưới</span>
                  )}
                </label>
                <select
                  value={formData.assignedSalesName}
                  onChange={e => setFormData({ ...formData, assignedSalesName: e.target.value })}
                  disabled={isSalesStaffUser && !isLead}
                  className={`w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none font-bold ${
                    isSalesStaffUser && !isLead ? 'opacity-80 cursor-not-allowed bg-neutral-100' : 'cursor-pointer'
                  }`}
                >
                  {!isSalesStaffUser && (
                    <option value="Chưa gán">Chưa gán (Tự động chia khi liên hệ)</option>
                  )}
                  {assignableSalesList.map((staff) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name} — {staff.roleTitle || 'Sales'}
                    </option>
                  ))}
                  {isSalesStaffUser && !assignableSalesList.some(s => s.name === currentUser.name) && (
                    <option value={currentUser.name}>{currentUser.name}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Ghi chú thêm</label>
                <input
                  type="text"
                  placeholder="Yêu cầu đặc biệt..."
                  value={formData.specialRequests || formData.notes}
                  onChange={e => setFormData({ ...formData, specialRequests: e.target.value, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={Boolean(duplicateCustomer)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                duplicateCustomer
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed opacity-80'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] active:scale-95'
              }`}
            >
              {duplicateCustomer ? '⚠️ SĐT Đã Trùng - Không Thể Lưu' : (customerToEdit ? 'Lưu Thay Đổi Hồ Sơ' : 'Lưu Khách Hàng Vào Hệ Thống')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
