'use client';

import { useState } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageContext';
import { useToast } from '@/components/ui/Toast';
import type { Address } from '@/types';

interface AddressSectionProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
  onAddressCreated: (addr: Address) => void;
}

const EMPTY_FORM = {
  label: '',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  district: '',
  subDistrict: '',
  province: '',
  postalCode: '',
  isDefault: false,
};

export function AddressSection({ addresses, selectedAddressId, onSelect, onAddressCreated }: AddressSectionProps) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const required = ['label', 'fullName', 'phone', 'addressLine1', 'district', 'subDistrict', 'province', 'postalCode'] as const;

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {};
    for (const field of required) {
      if (!form[field].trim()) newErrors[field] = true;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const addr = data.data || data;
      onAddressCreated(addr);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setErrors({});
      addToast(t.checkout.addressSaved, 'success');
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const inputClass = (field: string) =>
    `w-full border rounded-sm px-3 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none transition-colors ${
      errors[field] ? 'border-rose-300 focus:border-rose-400' : 'border-stone-200 focus:border-stone-400'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold text-stone-700">
          <MapPin className="w-4 h-4" />
          {t.checkout.deliveryAddress}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.checkout.addNewAddress}
        </button>
      </div>

      {/* Address cards */}
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-stone-400 py-6 text-center border border-dashed border-stone-200 rounded-sm">
          {t.checkout.noAddresses}
        </p>
      )}

      <div className="space-y-2.5">
        {addresses.map((addr) => (
          <button
            key={addr._id}
            onClick={() => onSelect(addr._id)}
            className={`w-full text-left p-4 rounded-sm border-2 transition-all ${
              selectedAddressId === addr._id
                ? 'border-stone-800 bg-stone-50'
                : 'border-stone-100 hover:border-stone-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs tracking-wider uppercase font-semibold text-stone-600">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] tracking-wider uppercase bg-stone-800 text-white px-1.5 py-0.5 rounded-sm">
                      {t.address.default}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-stone-800">{addr.fullName}</p>
                <p className="text-xs text-stone-500 mt-0.5">{addr.phone}</p>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                  {addr.addressLine1}, {addr.subDistrict}, {addr.district}, {addr.province} {addr.postalCode}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                selectedAddressId === addr._id
                  ? 'border-stone-800 bg-stone-800'
                  : 'border-stone-300'
              }`}>
                {selectedAddressId === addr._id && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Inline add form */}
      {showForm && (
        <div className="mt-4 border border-stone-200 rounded-sm p-5 space-y-4 bg-stone-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.checkout.addressLabel}</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => updateField('label', e.target.value)}
                placeholder="Home"
                className={inputClass('label')}
              />
              {errors.label && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
            </div>
            <div>
              <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.fullName}</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className={inputClass('fullName')}
              />
              {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.phone}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={inputClass('phone')}
            />
            {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
          </div>

          <div>
            <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.address}</label>
            <input
              type="text"
              value={form.addressLine1}
              onChange={(e) => updateField('addressLine1', e.target.value)}
              className={inputClass('addressLine1')}
            />
            {errors.addressLine1 && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
          </div>

          <div>
            <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.address} 2</label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) => updateField('addressLine2', e.target.value)}
              className="w-full border border-stone-200 rounded-sm px-3 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.subDistrict}</label>
              <input
                type="text"
                value={form.subDistrict}
                onChange={(e) => updateField('subDistrict', e.target.value)}
                className={inputClass('subDistrict')}
              />
              {errors.subDistrict && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
            </div>
            <div>
              <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.district}</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => updateField('district', e.target.value)}
                className={inputClass('district')}
              />
              {errors.district && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.province}</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => updateField('province', e.target.value)}
                className={inputClass('province')}
              />
              {errors.province && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
            </div>
            <div>
              <label className="text-xs text-stone-500 font-medium mb-1.5 block">{t.address.postalCode}</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                className={inputClass('postalCode')}
              />
              {errors.postalCode && <p className="text-[11px] text-rose-500 mt-1">{t.checkout.requiredField}</p>}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => updateField('isDefault', e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
            />
            <span className="text-xs text-stone-600">{t.address.setDefault}</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-stone-900 text-white text-xs tracking-widest uppercase font-medium px-6 py-2.5 rounded-sm hover:bg-stone-800 transition-colors disabled:opacity-40"
            >
              {t.address.save}
            </button>
            <button
              onClick={() => { setShowForm(false); setErrors({}); }}
              className="text-xs text-stone-500 hover:text-stone-700 px-4 py-2.5 transition-colors"
            >
              {t.address.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
