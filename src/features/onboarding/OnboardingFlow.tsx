import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { repository } from '../../lib/repository';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Building2, Check, ChevronRight } from 'lucide-react';
import { BusinessType } from '../../types';

export function OnboardingFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [businessType, setBusinessType] = useState<BusinessType>('Hotel');
  const [orgName, setOrgName] = useState('');
  const [country, setCountry] = useState('US');
  const [propertyName, setPropertyName] = useState('');
  const [propertyCity, setPropertyCity] = useState('');

  if (!user) return null;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Organization
      const org = await repository.createOrganization({
        name: orgName,
        business_type: [businessType],
        country,
        timezone: 'UTC',
        default_currency: 'USD'
      }, user.id);

      // 2. Create Initial Property
      await repository.createProperty({
        organization_id: org.id,
        name: propertyName,
        property_type: businessType,
        country,
        state: '',
        city: propertyCity,
        address: '',
      });

      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-teal-700" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900">Welcome to Bookzee</h1>
            <p className="text-stone-500 text-lg max-w-sm mx-auto pb-4">
              Let's set up your hospitality business. It only takes a few minutes.
            </p>
            <Button onClick={() => setStep(2)} size="lg" className="w-full sm:w-auto">
              Get Started <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-900">What type of property do you operate?</h2>
              <p className="text-stone-500">Select the primary category that best describes your business.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['Hotel', 'Hostel', 'Homestay', 'Resort', 'Boutique', 'Guesthouse'] as BusinessType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setBusinessType(type)}
                  className={`p-4 text-left border rounded-lg transition-all ${
                    businessType === type 
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' 
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-stone-900 flex justify-between items-center">
                    {type}
                    {businessType === type && <Check className="w-4 h-4 text-teal-600" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-900">Business Information</h2>
              <p className="text-stone-500">What is the name of your organization or operating company?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input 
                  id="orgName" 
                  placeholder="e.g. Valley View Hospitality" 
                  value={orgName} 
                  onChange={e => setOrgName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Operating Country</Label>
                <select 
                  id="country" 
                  className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="IN">India</option>
                  <option value="AU">Australia</option>
                  <option value="CA">Canada</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)} disabled={!orgName.trim()}>Continue</Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-900">Your First Property</h2>
              <p className="text-stone-500">Let's set up the first property you manage.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name</Label>
                <Input 
                  id="propertyName" 
                  placeholder={`e.g. ${orgName || 'Valley View'} Resort`} 
                  value={propertyName} 
                  onChange={e => setPropertyName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City / Location</Label>
                <Input 
                  id="city" 
                  placeholder="e.g. San Francisco" 
                  value={propertyCity} 
                  onChange={e => setPropertyCity(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={() => setStep(5)} disabled={!propertyName.trim()}>Continue</Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 text-center py-4">
            <div className="mx-auto bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-900">Your workspace is ready</h2>
              <p className="text-stone-500">We've set up your organization and first property.</p>
            </div>
            <Button size="lg" onClick={handleComplete} isLoading={isSubmitting} className="w-full sm:w-auto">
              Go to your dashboard <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-stone-200">
        <CardContent className="p-8 sm:p-10">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}
