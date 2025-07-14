import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ShimmerButton } from '../magicui/shimmer-button';
import { useContracts } from '../../hooks/useContracts';
import { CreateCampaignForm, TierForm } from '../../types/contracts';

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
  const [tiers, setTiers] = useState<TierForm[]>([]);
  const [currentTier, setCurrentTier] = useState<TierForm>({ name: '', amount: '' });
  const [errors, setErrors] = useState<Partial<CreateCampaignForm>>({});

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
      setTiers([]);
      onCampaignCreated();
    }
  };

  const addTier = () => {
    if (currentTier.name.trim() && currentTier.amount && parseFloat(currentTier.amount) > 0) {
      setTiers([...tiers, currentTier]);
      setCurrentTier({ name: '', amount: '' });
    }
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create New Campaign</h2>
        <p className="mt-2 text-gray-600">Start your crowdfunding journey today</p>
      </div>

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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Funding Tiers (Optional)</h3>
              <p className="text-sm text-gray-600">Create different funding levels for supporters</p>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Tier name"
                  value={currentTier.name}
                  onChange={(e) => setCurrentTier({ ...currentTier, name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount (ETH)"
                  value={currentTier.amount}
                  onChange={(e) => setCurrentTier({ ...currentTier, amount: e.target.value })}
                  className="w-32"
                />
                <Button
                  type="button"
                  onClick={addTier}
                  size="sm"
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {tiers.length > 0 && (
                <div className="space-y-2">
                  {tiers.map((tier, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{tier.name}</span>
                        <span className="ml-2 text-gray-600">{tier.amount} ETH</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTier(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ShimmerButton
              type="submit"
              disabled={isLoading}
              className="w-full h-12"
            >
              {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
            </ShimmerButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}