'use client';

import React from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { ThemeFontWrapper } from '@/app/components/ui/ThemeFontWrapper';

export default function PrivacyPolicyPage() {
  const { site } = useWebBuilder();
  const privacyPolicy = site?.legal?.privacyPolicy;
  const themeColors = useThemeColors();
  const themeFonts = useThemeFonts();

  return (
    <ThemeFontWrapper>
      <div 
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: themeColors.pageBackground }}
      >
        <div className="max-w-4xl mx-auto">
          <div 
            className="rounded-xl shadow-xl overflow-hidden"
            style={{ backgroundColor: themeColors.cardBackground }}
          >
            {/* Header Section */}
            <div 
              className="px-8 py-12 border-b"
              style={{ 
                borderColor: themeColors.inactiveLight,
                backgroundColor: themeColors.sectionBackgroundLight
              }}
            >
              <h1 
                className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
                style={{ 
                  color: themeColors.lightPrimaryText,
                  fontFamily: themeFonts.heading || 'var(--wb-heading-font, inherit)'
                }}
              >
                {privacyPolicy?.heading || 'Privacy Policy'}
              </h1>
              
              {privacyPolicy?.description && (
                <p 
                  className="text-lg leading-relaxed max-w-3xl"
                  style={{ 
                    color: themeColors.lightSecondaryText,
                    fontFamily: themeFonts.body || 'var(--wb-body-font, inherit)'
                  }}
                >
                  {privacyPolicy.description}
                </p>
              )}
            </div>

            {/* Content Section */}
            <div className="px-8 py-12">
              <div className="prose prose-lg max-w-none">
                {privacyPolicy?.content ? (
                  <div 
                    className="space-y-8"
                    style={{ 
                      color: themeColors.lightPrimaryText,
                      fontFamily: themeFonts.body || 'var(--wb-body-font, inherit)'
                    }}
                  >
                    {typeof privacyPolicy.content === 'string' ? (
                      <div dangerouslySetInnerHTML={{ __html: privacyPolicy.content }} />
                    ) : (
                      <TiptapRenderer content={privacyPolicy.content} />
                    )}
                  </div>
                ) : (
                  <div 
                    className="text-center py-16"
                    style={{ color: themeColors.lightSecondaryText }}
                  >
                    <div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                      style={{ backgroundColor: themeColors.inactiveLight }}
                    >
                      <svg 
                        className="w-8 h-8" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                        />
                      </svg>
                    </div>
                    <h3 
                      className="text-xl font-semibold mb-3"
                      style={{ color: themeColors.lightPrimaryText }}
                    >
                      Privacy Policy content will be available soon
                    </h3>
                    <p className="mb-4">
                      Please contact the site administrator to update the Privacy Policy.
                    </p>
                    <button
                      className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: themeColors.primaryButton,
                        color: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = themeColors.hoverActive;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = themeColors.primaryButton;
                      }}
                    >
                      Contact Administrator
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div 
              className="px-8 py-6 border-t"
              style={{ 
                borderColor: themeColors.inactiveLight,
                backgroundColor: themeColors.sectionBackgroundLight
              }}
            >
              <p 
                className="text-sm text-center"
                style={{ color: themeColors.lightPrimaryText }}
              >
                Last updated:{' '}
                {site?.updatedAt
                  ? new Date(site.updatedAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ThemeFontWrapper>
  );
}
