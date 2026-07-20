import React from 'react';
import { Box, ScrollView, VStack, useToken } from '@gluestack-ui/themed';
import AurumHeader from '../src/components/AurumHeader';
import { useLanguage } from '../src/context/LanguageContext';

export default function NewFeatureScreen() {
    const { t } = useLanguage();
    
    // Tokens
    const screenBg = useToken('colors', 'black');
    const cardBg = useToken('colors', 'backgroundDark900');
    
    return (
        <Box flex={1} bg={screenBg}>
            <AurumHeader 
                title="Feature Title"
                subtitle="OPTIONAL SUBTITLE"
                variant="stack"
            />
            
            <ScrollView flex={1}>
                <VStack p="$4" space="lg">
                    {/* Content goes here */}
                </VStack>
            </ScrollView>
        </Box>
    );
}
