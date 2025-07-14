import React from 'react';
import { Wallet, Heart, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ShimmerButton } from '../magicui/shimmer-button';
import AnimatedGradientText from '../magicui/animated-gradient-text';
import { useWallet } from '../../hooks/useWallet';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { isConnected, address, connectWallet, disconnectWallet, isLoading } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-blue-600" />
              <AnimatedGradientText className="text-xl font-bold">
                CrowdFund
              </AnimatedGradientText>
            </div>
            
            {isConnected && (
              <nav className="hidden md:flex space-x-4">
                <button
                  onClick={() => onViewChange('campaigns')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'campaigns'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  All Campaigns
                </button>
                <button
                  onClick={() => onViewChange('create')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'create'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Create Campaign
                </button>
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  My Campaigns
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange('create')}
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </Button>
              </div>
            )}
            
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{formatAddress(address!)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <ShimmerButton
                onClick={connectWallet}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </ShimmerButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}