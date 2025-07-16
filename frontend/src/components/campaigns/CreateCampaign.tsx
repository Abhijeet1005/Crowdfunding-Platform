import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ShimmerButton } from '../magicui/shimmer-button';
import { useContracts } from '../../hooks/useContracts';
import { CreateCampaignForm } from '../../types/contracts';

interface CreateCampaignProps {
  onCampaignCreated: () => void;
}

export function CreateCampaign({ onCampaignCreated }: CreateCampaignProps) {
  const { createCampaign, isLoading } = useContracts();
  const [formData, setFormData] = useState<CreateCampaignForm>({
    name: '',
    description: '',
    goal: '',
    duration: '',
  });
  // Removed tiers state and related functions
  const [errors, setErrors] = useState<Partial<CreateCampaignForm>>({});
  const [showAddTiersMessage, setShowAddTiersMessage] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCampaignForm> = {};

    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.goal || parseFloat(formData.goal) <= 0) newErrors.goal = 'Valid goal amount is required';
    if (!formData.duration || parseInt(formData.duration) <= 0) newErrors.duration = 'Valid duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = await createCampaign(
      formData.name,
      formData.description,
      formData.goal,
      formData.duration
    );

    if (success) {
      setFormData({ name: '', description: '', goal: '', duration: '' });
      setShowAddTiersMessage(true);
      onCampaignCreated();
    }
  };

  // Removed addTier and removeTier functions

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create New Campaign</h2>
        <p className="mt-2 text-gray-600">Start your crowdfunding journey today</p>
      </div>

      {showAddTiersMessage && (
        <div className="p-4 mb-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-center">
          Campaign created! To allow supporters to fund your campaign, please add funding tiers from your campaign dashboard or details page.
        </div>
      )}

      <Card className="relative overflow-hidden">
        
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Campaign Name"
              placeholder="Enter campaign name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe your campaign and its goals"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={errors.description}
              rows={4}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Funding Goal (ETH)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                error={errors.goal}
                required
              />

              <Input
                label="Duration (Days)"
                type="number"
                min="1"
                placeholder="30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                error={errors.duration}
                required
              />
            </div>

            <ShimmerButton
              type="submit"
              disabled={isLoading}
              className="w-full h-12"
            >
              {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
            </ShimmerButton>
            <p className="text-xs text-gray-400 mt-2 text-center">
              After creating your campaign, you will need to add funding tiers from your campaign dashboard or details page.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}