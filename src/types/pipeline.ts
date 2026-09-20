export interface DragonCharacter {
  id: string;
  name: string;
  voice_id?: string;
  color_theme?: string;
  avatar_url?: string | null;
  sprites?: Record<string, string>;
  mouth_shapes?: string[];
}

export interface AudioTrack {
  id: string;
  type: 'bgm' | 'sfx';
  name: string;
  bpm?: number;
  volume?: number;
  file_path?: string;
}

export interface DialogueItem {
  id: string;
  speaker: string;
  text?: string;
  raw_text?: string;
  clean_text?: string;
  target_language?: string;
  explicit_pause_sec?: number;
  estimated_speech_sec?: number;
  total_slot_sec?: number;
  word_count?: number;
  syllable_count?: number;
  last_word_punchline?: string;
  localized_translations?: Record<string, string>;
  adaptation_notes?: string | null;
  sfx_cues?: string[];
}

export interface SceneCamera {
  type?: 'static' | 'pan_left' | 'pan_right' | 'zoom_in' | 'shake' | 'punch_in';
  start_zoom?: number;
  end_zoom?: number;
  intensity?: number;
}

export interface SceneBackground {
  type?: string;
  theme?: string;
  palette?: string[];
  parallax_speed?: number;
}

export interface VisualLayer {
  layer_id: string;
  z_index: number;
  type: string;
  actors?: string[];
  effect?: string;
}

export interface Scene {
  scene_index?: number;
  scene_id: string;
  title: string;
  duration_sec?: number;
  computed_duration_sec?: number;
  background?: SceneBackground;
  camera?: SceneCamera;
  dialogue?: DialogueItem[];
  visual_layers?: VisualLayer[];
  sfx_events?: string[];
}

export interface DragonTimecode {
  formatted: string;
  dragon_hours: number;
  dragon_minutes: number;
  dragon_seconds: number;
  cadence_beat: number;
}

export interface DragonManifest {
  manifest_id: string;
  episode_id?: string;
  title: string;
  series?: string;
  fps?: number;
  resolution?: {
    width: number;
    height: number;
    aspect_ratio: string;
  };
  temporal_system?: {
    unit?: string;
    framework?: string;
    dragon_hour_minutes?: number;
    micro_act_minutes?: number;
    beat_cadence_seconds?: number;
    total_duration_sec?: number;
    total_frames?: number;
    dragon_timecode?: DragonTimecode;
    micro_acts_count?: number;
  };
  characters?: DragonCharacter[] | Record<string, DragonCharacter>;
  audio_tracks?: AudioTrack[];
  scenes: Scene[];
}

export interface CodeScriptItem {
  id: string;
  title: string;
  filename: string;
  language: string;
  category: 'orchestrator' | 'generator' | 'renderer' | 'parser' | 'bridge' | 'termux' | 'manifest';
  description: string;
  content: string;
  termuxCommand: string;
}
