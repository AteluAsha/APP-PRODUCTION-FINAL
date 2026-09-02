/**
 * Cloudflare R2 public URLs for the Silent Background Vault (28 tracks).
 *
 * Keys are exact hosted filenames (case-sensitive). Playback is file:/// only
 * after download into FileSystem.documentDirectory/sanctuary-audio/.
 */

const R2_PUBLIC =
    'https://pub-8bca6c1eb390402899d44e670911141b.r2.dev'

function r2(filename: string): string {
    return `${R2_PUBLIC}/${filename}`
}

export const SANCTUARY_HOSTED_URLS: Record<string, string> = {
    'Day1_RootDay_MasterEmbodiment_refined_AwkeningSoul.mp3':
        r2('Day1_RootDay_MasterEmbodiment_refined_AwkeningSoul.mp3'),
    'Day1_CrystalBowlSoundBath_RootChakra_AwakeningSoul.mp3':
        r2('Day1_CrystalBowlSoundBath_RootChakra_AwakeningSoul.mp3'),
    'Day1_7thDivineLaw_AshaSpeaks.mp3':
        r2('Day1_7thDivineLaw_AshaSpeaks.mp3'),
    'Day1_396hz_plus256_TuningFork.aac':
        r2('Day1_396hz_plus256_TuningFork.aac'),

    'Day2_SacralChakraEmbodiment_SoulSchool.mp3':
        r2('Day2_SacralChakraEmbodiment_SoulSchool.mp3'),
    'Day2_CrystalBowlSoundBacth_AwakeningSoul.mp3':
        r2('Day2_CrystalBowlSoundBacth_AwakeningSoul.mp3'),
    'Day2_6thDivineLaw_AshaSpeaks.mp3':
        r2('Day2_6thDivineLaw_AshaSpeaks.mp3'),
    'Day2_417hz_tuningfork.aac':
        r2('Day2_417hz_tuningfork.aac'),

    'DAY3_ManipuraEmbodiment_SoulSchool.mp3':
        r2('DAY3_ManipuraEmbodiment_SoulSchool.mp3'),
    'Day3_CrystalBowlSoundBath_AwakeningSoul.mp3':
        r2('Day3_CrystalBowlSoundBath_AwakeningSoul.mp3'),
    'Day3_5thDivineLaw_AshaSpeaks.mp3':
        r2('Day3_5thDivineLaw_AshaSpeaks.mp3'),
    'Day3_528hz_tuningfork.aac':
        r2('Day3_528hz_tuningfork.aac'),

    'Day4_HeartChakraEmbodiment_SoulSchool_Remastered.mp3':
        r2('Day4_HeartChakraEmbodiment_SoulSchool_Remastered.mp3'),
    'Day4_CrystalBowlSoundBath_AwakeningSoul.mp3':
        r2('Day4_CrystalBowlSoundBath_AwakeningSoul.mp3'),
    'Day4_4thDivineLaw_AshaSpeaks.mp3':
        r2('Day4_4thDivineLaw_AshaSpeaks.mp3'),
    'Day4_639Hz_tuningfork.aac':
        r2('Day4_639Hz_tuningfork.aac'),

    'Day5_ThroatChakra_SoulSchool_TAGGED.mp3':
        r2('Day5_ThroatChakra_SoulSchool_TAGGED.mp3'),
    'Day5_CrystalBowlSoundBath_AwakeningSoul.mp3':
        r2('Day5_CrystalBowlSoundBath_AwakeningSoul.mp3'),
    'Day5_3rdDivineLaw_AshaSpeaks.mp3':
        r2('Day5_3rdDivineLaw_AshaSpeaks.mp3'),
    'Day5_741hz_tuningfork.aac':
        r2('Day5_741hz_tuningfork.aac'),

    'Day6_Ajna_MasterEmbodiment_SoulSchool_TAGGED.mp3':
        r2('Day6_Ajna_MasterEmbodiment_SoulSchool_TAGGED.mp3'),
    'Day6_852hz_tuningFork.aac':
        r2('Day6_852hz_tuningFork.aac'),
    'Day6_CrystalBowlSoundBath_AwakeningSoul.mp3':
        r2('Day6_CrystalBowlSoundBath_AwakeningSoul.mp3'),
    'Day6_2ndDivineLaw_AshaSpeaks.mp3':
        r2('Day6_2ndDivineLaw_AshaSpeaks.mp3'),

    'Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool__TAGGED_.mp3':
        r2('Day7_CrownChakra_MasterEmbodiment_Meditation_SoulSchool__TAGGED_.mp3'),
    'Day7_CrystalBowlSoundBath_AwakeningSoul.mp3':
        r2('Day7_CrystalBowlSoundBath_AwakeningSoul.mp3'),
    'Day7_1stDivineLaw_AshaSpeaks.mp3':
        r2('Day7_1stDivineLaw_AshaSpeaks.mp3'),
    'Day7_963hz_tuningfork.aac':
        r2('Day7_963hz_tuningfork.aac'),
}
