import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native'
import React from 'react'
import { theme } from '@/constants/theme'
import { wp } from '@/helpers/common'

interface ButtonProps {
    title: string;
    onPress: () => void;
    backgroundColor?: string;
    textColor?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, backgroundColor, textColor, style, textStyle }) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: backgroundColor || theme.colors.primary },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.btnText, { color: textColor || theme.colors.background }, textStyle]}>
                {title}
            </Text>
        </TouchableOpacity>
    )
}

export default Button

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: theme.radius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5,
    },
    btnText: {
        textAlign: "center",
        fontSize: wp(5),
        fontWeight: "bold",
    },
})
