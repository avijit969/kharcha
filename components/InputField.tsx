import { StyleSheet, TextInput, useColorScheme, View } from 'react-native'
import React, { useState } from 'react'
import { wp } from '@/helpers/common'
import { theme } from '@/constants/theme'

interface Props {
    icon?: React.ReactNode
    placeholder: string
    onChange: (text: string) => void
    value: string
    inputType?: "default" | "email-address" | "numeric" | "phone-pad" | "visible-password"
    secureTextEntry?: boolean
}

const InputField: React.FC<Props> = ({
    icon,
    placeholder,
    onChange,
    value,
    inputType = "default",
    secureTextEntry = false
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const theme = useColorScheme()

    return (
        <View style={[styles.container, isFocused && styles.focusedContainer]}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <TextInput
                style={[styles.input, { color: theme === 'light' ? "#000" : "#fff" }]}
                placeholder={placeholder}
                onChangeText={onChange}
                value={value}
                keyboardType={inputType}
                secureTextEntry={secureTextEntry}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor={theme === 'light' ? "#ccc" : "#fff"}

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
        borderColor: '#ccc',
        borderRadius: wp(5),
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginVertical: 5,
    },
    focusedContainer: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
})
