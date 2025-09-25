'use client'

import React from 'react'
import { SidePanelForm, SidePanelSection } from '@/components/layout/dashboard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddItemFormProps {
  onSave: () => void
  onCancel: () => void
}

export function AddItemForm({ onSave, onCancel }: AddItemFormProps) {
  return (
    <SidePanelForm onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <SidePanelSection title="Thông tin cơ bản">
        <div className="space-y-2">
          <Label htmlFor="item-name">Tên mặt hàng</Label>
          <Input id="item-name" placeholder="Ví dụ: Áo thun nam" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item-sku">SKU</Label>
          <Input id="item-sku" placeholder="Ví dụ: ATN-BLK-M" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item-description">Mô tả</Label>
          <Textarea id="item-description" placeholder="Mô tả chi tiết về sản phẩm..." />
        </div>
      </SidePanelSection>

      <SidePanelSection title="Quản lý kho">
        <div className="space-y-2">
          <Label htmlFor="item-quantity">Số lượng tồn kho</Label>
          <Input id="item-quantity" type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item-category">Danh mục</Label>
          <Select>
            <SelectTrigger id="item-category">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clothing">Quần áo</SelectItem>
              <SelectItem value="electronics">Điện tử</SelectItem>
              <SelectItem value="books">Sách</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SidePanelSection>
    </SidePanelForm>
  )
}
