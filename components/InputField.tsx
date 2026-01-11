import { StyleSheet, TextInput, useColorScheme, View, TextInputProps } from 'react-native'
import React, { useState } from 'react'
import { wp } from '@/helpers/common'
import { theme } from '@/constants/theme'

interface Props extends Omit<TextInputProps, 'onChange'> {
    icon?: React.ReactNode
    onChange: (text: string) => void
    value: string
    // Removed specific inputType and secureTextEntry as they are part of TextInputProps
}

const InputField: React.FC<Props> = ({
    icon,
    onChange,
    value,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark';

    return (
        <View style={[
            styles.container,
            isFocused && styles.focusedContainer,
            { borderColor: isDark ? '#444' : '#E0E0E0', backgroundColor: isDark ? '#1A1A1A' : '#F9F9F9' }
        ]}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <TextInput
                style={[styles.input, { color: isDark ? "#fff" : "#1F2937" }, style]}
                onChangeText={onChange}
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor={isDark ? "#888" : "#9CA3AF"}
                {...props}
            />
        </View>
    )
}

export default InputField

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16, // Modern rounded corners
        paddingHorizontal: 16,
        paddingVertical: 14,
        width: '100%',
    },
    focusedContainer: {
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: wp(4),
        fontFamily: 'Inter_400Regular', // Assuming Inter font is available, else system font
    },
})
