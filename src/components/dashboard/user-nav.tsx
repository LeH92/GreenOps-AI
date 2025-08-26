'use client'

import { useState } from 'react'
import { LogOut, User, Settings, HelpCircle } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/hooks/useAuth'
import { AuthLoadingButton } from '@/components/auth/loading-states'

/**
 * User Navigation Component
 * User dropdown menu for dashboard header
 * Following cursor rules and ShadCN patterns
 */

export function UserNav() {
  const { user, signOut, loading, getUserDisplayName, getUserInitials } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  /**
   * Handle user sign out
   */
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user) {
    return null
  }

  const displayName = getUserDisplayName()
  const initials = getUserInitials()
  const email = user.email || 'No email'
  const isEmailVerified = user.email_confirmed_at !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.user_metadata?.avatar_url} 
              alt={displayName} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              {!isEmailVerified && (
                <Badge variant="outline" className="text-xs">
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              Soon
            </Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              Soon
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut || loading}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * User Profile Card Component
 * Expanded user info for profile pages (future use)
 */
export function UserProfileCard() {
  const { user, getUserDisplayName } = useAuth()

  if (!user) {
    return null
  }

  const displayName = getUserDisplayName()
  const email = user.email || 'No email'
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'
  const isEmailVerified = user.email_confirmed_at !== null

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage 
            src={user.user_metadata?.avatar_url} 
            alt={displayName} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{displayName}</h3>
            {isEmailVerified ? (
              <Badge variant="default" className="text-xs">
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Unverified
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">{email}</p>
          
          <p className="text-xs text-muted-foreground">
            Member since {createdAt}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * User Avatar Component
 * Simple avatar display for various uses
 */
interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  className?: string
}

export function UserAvatar({ size = 'md', showName = false, className = '' }: UserAvatarProps) {
  const { user, getUserDisplayName, getUserInitials } = useAuth()

  if (!user) {
    return null
  }

  const displayName = getUserDisplayName()
  const initials = getUserInitials()

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base',
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={user.user_metadata?.avatar_url} 
          alt={displayName} 
        />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showName && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          {displayName}
        </span>
      )}
    </div>
  )
}

/**
 * User Status Indicator
 * Shows user online/offline status (future use)
 */
interface UserStatusProps {
  status?: 'online' | 'offline' | 'away'
  className?: string
}

export function UserStatus({ status = 'online', className = '' }: UserStatusProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  }

  return (
    <div className={`relative ${className}`}>
      <UserAvatar size="md" />
      <div 
        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusColors[status]}`}
        title={`Status: ${status}`}
      />
    </div>
  )
}
