/**
 * Ancestral gnosis field — dark gold geometry.
 * Do not reuse course headers, part2bg, Sound Bath fields, or chakra photos.
 */
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export function AncestralFieldLayer() {
    return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.root]}>
            <LinearGradient
                colors={['#070605', '#100C08', '#050403']}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.goldWash} />
            <View style={[styles.ring, styles.ringOuter]} />
            <View style={[styles.ring, styles.ringMid]} />
            <View style={[styles.ring, styles.ringInner]} />
            <View style={styles.diamond} />
            <View style={styles.horizon} />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
    },
    goldWash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(232, 201, 140, 0.05)',
    },
    ring: {
        position: 'absolute',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.16)',
        borderRadius: 999,
    },
    ringOuter: {
        width: 340,
        height: 340,
        top: '18%',
    },
    ringMid: {
        width: 220,
        height: 220,
        top: '24%',
        borderColor: 'rgba(232, 201, 140, 0.22)',
    },
    ringInner: {
        width: 110,
        height: 110,
        top: '31%',
        borderColor: 'rgba(232, 201, 140, 0.32)',
    },
    diamond: {
        position: 'absolute',
        alignSelf: 'center',
        top: '33%',
        width: 42,
        height: 42,
        borderWidth: 1,
        borderColor: 'rgba(232, 201, 140, 0.45)',
        transform: [{ rotate: '45deg' }],
    },
    horizon: {
        position: 'absolute',
        left: 48,
        right: 48,
        bottom: '22%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(232, 201, 140, 0.28)',
    },
})
