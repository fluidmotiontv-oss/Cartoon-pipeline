import { DragonManifest } from '../types/pipeline';

export const SAMPLE_DRAGON_MANIFEST: DragonManifest = {
  manifest_id: "d9-ep01-fluid-temporal-shift",
  episode_id: "d9-ep01",
  title: "The 54-Minute Hour Paradox",
  series: "Dragon 9 Synchronized Time",
  fps: 24,
  resolution: {
    width: 1920,
    height: 1080,
    aspect_ratio: "16:9"
  },
  temporal_system: {
    unit: "Dragon9 54-Minute Hour",
    dragon_hour_minutes: 54,
    micro_act_minutes: 9,
    beat_cadence_seconds: 18,
    total_duration_sec: 17.5,
    dragon_timecode: {
      formatted: "D9[00:00:17.12]",
      dragon_hours: 0,
      dragon_minutes: 0,
      dragon_seconds: 17,
      cadence_beat: 1
    }
  },
  characters: [
    {
      id: "dragon_sensei",
      name: "Master Chronos",
      voice_id: "Kore",
      color_theme: "#f59e0b",
      mouth_shapes: ["rest", "A", "E", "I", "O", "U", "closed"]
    },
    {
      id: "comic_apprentice",
      name: "Kip Speedline",
      voice_id: "Puck",
      color_theme: "#14b8a6",
      mouth_shapes: ["rest", "A", "E", "I", "O", "U", "closed"]
    }
  ],
  audio_tracks: [
    {
      id: "bgm_cyber_dojo",
      type: "bgm",
      name: "Celestial Dojo Synth",
      bpm: 108,
      volume: 0.4
    },
    {
      id: "sfx_whoosh",
      type: "sfx",
      name: "Temporal Warp Whoosh",
      volume: 0.85
    }
  ],
  scenes: [
    {
      scene_id: "scene_001",
      title: "Dojo Awakening",
      duration_sec: 5.5,
      computed_duration_sec: 5.5,
      background: {
        type: "procedural",
        theme: "cyber_neon_dojo",
        parallax_speed: 0.5
      },
      camera: {
        type: "pan_left",
        start_zoom: 1.0,
        end_zoom: 1.05
      },
      dialogue: [
        {
          id: "dlg_001",
          speaker: "dragon_sensei",
          text: "Welcome apprentice [pause: 0.4s] to the synchronized temporal rhythm of Dragon 9.",
          clean_text: "Welcome apprentice to the synchronized temporal rhythm of Dragon 9.",
          target_language: "en",
          explicit_pause_sec: 0.4,
          estimated_speech_sec: 4.2,
          word_count: 10,
          syllable_count: 18,
          last_word_punchline: "9",
          localized_translations: {
            de: "Willkommen Schüler [pause: 0.4s] im synchronisierten Zeittakt von Dragon 9.",
            es: "Bienvenido aprendiz [pause: 0.4s] al ritmo temporal sincronizado de Dragon 9.",
            fr: "Bienvenue apprenti [pause: 0.4s] dans le rythme temporel synchronisé de Dragon 9.",
            ja: "ようこそ弟子よ [pause: 0.4s] ドラゴン9の同期された時間リズムへ。"
          },
          adaptation_notes: "Established sacred tone, brief 0.4s breathing pause."
        }
      ]
    },
    {
      scene_id: "scene_002",
      title: "The Calendar Dispute",
      duration_sec: 6.8,
      computed_duration_sec: 6.8,
      background: {
        type: "procedural",
        theme: "fluid_clock_matrix",
        parallax_speed: 0.8
      },
      camera: {
        type: "zoom_in",
        start_zoom: 1.0,
        end_zoom: 1.15
      },
      dialogue: [
        {
          id: "dlg_002",
          speaker: "comic_apprentice",
          text: "Wait, so if an hour is only 54 minutes [pause: 0.6s] does that mean my lunch break just got stolen by math?",
          clean_text: "Wait, so if an hour is only 54 minutes does that mean my lunch break just got stolen by math?",
          target_language: "en",
          explicit_pause_sec: 0.6,
          estimated_speech_sec: 5.4,
          word_count: 18,
          syllable_count: 24,
          last_word_punchline: "math",
          localized_translations: {
            de: "Moment, wenn eine Stunde nur 54 Minuten hat [pause: 0.6s], wurde meine Mittagspause gerade von der Mathematik geklaut?",
            es: "Espera, si una hora dura solo 54 minutos [pause: 0.6s], ¿significa que las matemáticas me acaban de robar el almuerzo?",
            fr: "Attends, si une heure ne fait que 54 minutes [pause: 0.6s], ça veut dire que ma pause déj vient d'être volée par les maths?",
            ja: "待って、もし1時間が54分なら [pause: 0.6s] 僕の昼休みは数学に盗まれたってこと？"
          },
          adaptation_notes: "0.6s comedic beat pause before the punchline; last-word emphasis preserved across all languages."
        }
      ]
    },
    {
      scene_id: "scene_003",
      title: "Cosmic Realization",
      duration_sec: 5.2,
      computed_duration_sec: 5.2,
      background: {
        type: "procedural",
        theme: "dragon_celestial_sun",
        parallax_speed: 1.0
      },
      camera: {
        type: "punch_in",
        intensity: 0.8
      },
      dialogue: [
        {
          id: "dlg_003",
          speaker: "dragon_sensei",
          text: "No Kip. [pause: 0.5s] It means you now have nine extra minutes to celebrate existence!",
          clean_text: "No Kip. It means you now have nine extra minutes to celebrate existence!",
          target_language: "en",
          explicit_pause_sec: 0.5,
          estimated_speech_sec: 4.1,
          word_count: 13,
          syllable_count: 20,
          last_word_punchline: "existence",
          localized_translations: {
            de: "Nein Kip. [pause: 0.5s] Es bedeutet, dass du jetzt neun zusätzliche Minuten hast, um das Dasein zu feiern!",
            es: "No Kip. [pause: 0.5s] ¡Significa que ahora tienes nueve minutos extra para celebrar la existencia!",
            fr: "Non Kip. [pause: 0.5s] Ça veut dire que tu as neuf minutes de plus pour célébrer l'existence!",
            ja: "違うぞキップ。 [pause: 0.5s] 存在を祝うための時間が9分余計にできたということだ！"
          },
          adaptation_notes: "0.5s deadpan pause before optimistic philosophical punchline."
        }
      ]
    }
  ]
};
