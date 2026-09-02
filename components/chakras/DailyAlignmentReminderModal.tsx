/**
 * Opt-in modal for daily alignment reminders (Root goodbye + Profile).
 */

import React from 'react'
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppText } from '@/components/AppText'
import { Ionicons } from '@expo/vector-icons'
import { addHapticFeedback, HapticStrength } from '@/utils/haptic'
import { MODAL_CARD_MAX_WIDTH } from '@/constants/layout'
import { DAILY_ALIGNMENT_MODAL_COPY } from '@/constants/journeyNotificationCopy'

interface DailyAlignmentReminderModalProps {
  visible: boolean
  onAllow: () => void
  onNotNow: () => void
}

export function DailyAlignmentReminderModal({
  visible,
  onAllow,
  onNotNow,
}: DailyAlignmentReminderModalProps) {
  const handleAllow = () => {
    addHapticFeedback(HapticStrength.Medium)
    onAllow()
  }

  const handleNotNow = () => {
    addHapticFeedback(HapticStrength.Light)
    onNotNow()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleNotNow}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      {visible ? (
        <View
          style={[
            styles.overlay,
            Platform.OS === 'android' && { elevation: 9999, zIndex: 9999 },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleNotNow}
            accessibilityLabel="Dismiss"
          />
          <View
            style={[
              styles.card,
              Platform.OS === 'android' && { elevation: 24, zIndex: 1 },
            ]}
            pointerEvents="box-none"
            collapsable={false}
          >
            <LinearGradient
              colors={[
                'rgba(24, 22, 20, 0.99)',
                'rgba(14, 12, 10, 0.99)',
                'rgba(10, 14, 12, 0.99)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="heart-outline"
                    size={22}
                    color="rgba(232, 201, 140, 0.92)"
                  />
                </View>
                <AppText
                  font="cormorant-regular"
                  style={styles.title}
                >
                  {DAILY_ALIGNMENT_MODAL_COPY.title}
                </AppText>
              </View>

              <AppText font="cormorant-regular" style={styles.body}>
                {DAILY_ALIGNMENT_MODAL_COPY.body}
              </AppText>

              <AppText font="cormorant-italic" style={styles.profileNote}>
                {DAILY_ALIGNMENT_MODAL_COPY.profileNote}
              </AppText>

              <Pressable
                onPress={handleAllow}
                style={({ pressed }) => [pressed && { opacity: 0.9 }]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <LinearGradient
                  colors={[
                    'rgba(168, 201, 154, 0.35)',
                    'rgba(232, 201, 140, 0.18)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.allowButton}
                >
                  <AppText
                    font="cormorant-regular"
                    style={styles.allowButtonText}
                  >
                    {DAILY_ALIGNMENT_MODAL_COPY.allowLabel}
                  </AppText>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={handleNotNow}
                style={styles.notNowWrap}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <AppText font="cormorant-italic" style={styles.notNowText}>
                  {DAILY_ALIGNMENT_MODAL_COPY.notNowLabel}
                </AppText>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      ) : null}
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: MODAL_CARD_MAX_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(232, 201, 140, 0.28)',
    shadowColor: 'rgba(232, 201, 140, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    padding: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(232, 201, 140, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    color: 'rgba(255, 248, 236, 0.96)',
    fontSize: 22,
    letterSpacing: 0.3,
    flex: 1,
  },
  body: {
    color: 'rgba(255, 248, 236, 0.88)',
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 12,
  },
  profileNote: {
    color: 'rgba(232, 201, 140, 0.78)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  allowButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 201, 154, 0.4)',
    alignItems: 'center',
    marginBottom: 10,
  },
  allowButtonText: {
    color: 'rgba(230, 245, 220, 0.96)',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  notNowWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  notNowText: {
    color: 'rgba(255, 255, 255, 0.48)',
    fontSize: 15,
  },
})
