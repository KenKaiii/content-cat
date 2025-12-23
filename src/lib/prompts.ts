export interface Prompt {
  id: string;
  title: string;
  description: string;
  image: string;
  category: PromptCategory;
  prompt: string;
}

export type PromptCategory =
  | "all"
  | "portrait"
  | "realistic"
  | "profile"
  | "filters"
  | "enhanced"
  | "product";

export const prompts: Prompt[] = [
  // Profile / Avatar
  {
    id: "bw-side-profile",
    title: "B&W Side Profile",
    description: "Hyper-realistic black and white studio portrait",
    image: "/images/prompts/bw-side-profile.jpg",
    category: "profile",
    prompt: `Hyper-realistic side profile portrait with strong rim lighting, dark minimalist background, thoughtful expression, and cinematic lighting. High resolution black and white studio photography. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "mirror-selfie-aesthetic",
    title: "Mirror Selfie",
    description: "Photorealistic 8K mirror selfie with natural lighting",
    image: "/images/prompts/mirror-selfie-aesthetic.jpg",
    category: "profile",
    prompt: `Generate an 8K photorealistic mirror selfie with high face consistency based on reference image. Sunlit bedroom background, face identical to reference image. Keep the subject's exact facial features.`,
  },
  {
    id: "35mm-portrait",
    title: "35mm Portrait",
    description: "Dramatic black and white top-angle close-up",
    image: "/images/prompts/35mm-portrait.jpg",
    category: "profile",
    prompt: `Generate a top-angle close-up black and white portrait focused on the head facing forward. Use a 35mm lens look, ultra high quality. Proud expression. Deep black shadow background - only the face, upper chest, and shoulder visible. Keep the subject's exact facial features.`,
  },
  {
    id: "corporate-editorial",
    title: "Corporate Editorial",
    description: "8K high-fashion executive portrait",
    image: "/images/prompts/corporate-editorial.jpg",
    category: "profile",
    prompt: `Ultra-realistic, 8K corporate high-fashion editorial portrait. 100% facial identity preservation from reference. Canon EOS R5 with 85mm lens style. Subject in tailored charcoal blazer, luxury modern office with floor-to-ceiling windows, soft natural window lighting, hyper-realistic 8K quality.`,
  },
  {
    id: "dramatic-bw-portrait",
    title: "Dramatic B&W",
    description: "Moody cinematic black and white portrait",
    image: "/images/prompts/dramatic-bw-portrait.jpg",
    category: "profile",
    prompt: `A dramatic black-and-white portrait. Side profile with strong facial features. Soft studio lighting highlights skin texture and face contours. Minimal smooth background, clean cinematic atmosphere. High-resolution, realistic photography, moody tone, shallow depth of field. Keep the subject's exact facial features.`,
  },
  {
    id: "soft-grunge-cat",
    title: "Soft Grunge Cat",
    description: "E-girl aesthetic selfie with black cat",
    image: "/images/prompts/soft-grunge-cat.jpg",
    category: "profile",
    prompt: `Close-up selfie portrait in soft grunge, e-girl aesthetic, holding black cat cheek-to-cheek. Casual top, silver necklace with pendant, beige wall background, warm dim lighting. Keep the subject's exact facial features.`,
  },
  {
    id: "ig-baddie-mirror",
    title: "IG Baddie Mirror",
    description: "Hyper-realistic Instagram style mirror selfie",
    image: "/images/prompts/ig-baddie-mirror.jpg",
    category: "profile",
    prompt: `Hyper-realistic, 8K 'IG Baddie' style mirror selfie. Bathroom counter knee-up mirror selfie with phone flash domination, dark bathroom setting, confident pose, stylish outfit, flash flare effects, confident expression. Keep the subject's exact facial features.`,
  },

  // Portrait
  {
    id: "cinematic-light",
    title: "Cinematic Light",
    description: "Dramatic lighting with sharp diagonal beams",
    image: "/images/prompts/cinematic-light.jpg",
    category: "portrait",
    prompt: `Maintain the same face and person (use attached photo for accurate face). Hyper-realistic cinematic. Create an 8K photorealistic image. A close-up portrait with hair falling naturally across the face. Eyes gazing upwards and to the right, catching a sharp, diagonal beam of natural light that illuminates the high points of the cheekbone and nose. Soft, natural skin texture. Keep the subject's exact facial features.`,
  },
  {
    id: "window-light",
    title: "Window Light",
    description: "Intimate portrait with dramatic window shadows",
    image: "/images/prompts/window-light.jpg",
    category: "portrait",
    prompt: `Create a realistic image with the subject's face and appearance exactly as in the reference photo — do not change any physical characteristics. The person should have arms raised behind the head, in a confident pose. The lighting should come from a window, projecting streaks of light and shadow on the face and body, creating dramatic and artistic contrast. The background should be simple and neutral. The overall mood should be intimate, elegant and cinematic.`,
  },
  {
    id: "marble-bust",
    title: "Marble Bust",
    description: "Melancholic portrait with classical marble statue",
    image: "/images/prompts/marble-bust.jpg",
    category: "portrait",
    prompt: `Person leaning head against classical marble bust, warm dramatic lighting, dusty museum setting, sepia tones, intimate melancholic mood, hyper-realistic marble textures. Keep the subject's exact facial features.`,
  },
  {
    id: "balcony-portrait",
    title: "Balcony Portrait",
    description: "8K cinematic outdoor portrait on balcony",
    image: "/images/prompts/balcony-portrait.jpg",
    category: "portrait",
    prompt: `8K ultra-realistic, cinematic outdoor portrait on old concrete balcony facing away, touching neck with both hands in relaxed pose, casual stylish outfit, green plants and modern building in blurred background. Keep the subject's exact facial features.`,
  },
  {
    id: "rembrandt-lighting",
    title: "Rembrandt Light",
    description: "Intimate portrait with classic Rembrandt lighting",
    image: "/images/prompts/rembrandt-lighting.jpg",
    category: "portrait",
    prompt: `Intimate, intense portrait with Rembrandt lighting. Vulnerable intense expression with direct eye contact, golden halo backlight on hair, natural skin tones, piercing eyes, hands framing face with silver jewelry, 85mm lens with soft filter, golden hour color grading. Keep the subject's exact facial features.`,
  },
  {
    id: "luxury-restaurant",
    title: "Luxury Dinner",
    description: "8K portrait in dimly lit luxury restaurant",
    image: "/images/prompts/luxury-restaurant.jpg",
    category: "portrait",
    prompt: `8K, high-night-contrast portrait posing in dimly lit, luxurious restaurant. Expressive eyes, elegant outfit, gold jewelry, hand under chin pose, white tablecloth with elegant gold lamp casting warm yellow light, spacious luxurious restaurant, dim night lighting, wide-angle lens. Keep the subject's exact facial features.`,
  },
  {
    id: "gq-editorial",
    title: "GQ Editorial",
    description: "Bold magazine cover style with dramatic lighting",
    image: "/images/prompts/gq-editorial.jpg",
    category: "portrait",
    prompt: `Create a bold, dramatic GQ-style editorial portrait with intense, directional lighting that creates striking shadows and highlights, emphasizing strong facial contours and jawline. The subject wears a sharply tailored, fashion-forward business casual outfit. Use a minimalist, high-contrast background with moody, dark gradients. The expression should be confident with a piercing gaze. Incorporate artistic shadow play and high-definition details to evoke a cinematic, magazine cover effect. Keep the subject's exact facial features.`,
  },
  {
    id: "urban-flash-portrait",
    title: "Urban Flash Portrait",
    description: "Bold night fashion portrait with hard flash lighting",
    image: "/images/prompts/urban-flash-portrait.jpg",
    category: "portrait",
    prompt: `Ultra-realistic fashion portrait of a person with natural body proportions against a concrete wall. Close-up shot, hands folded in front, looking directly at the camera, low angle perspective. Camera: Full-frame digital camera, 35mm lens f/1.8, ISO 400, shutter speed 1/160, aperture f/2.2, RAW quality. Dark vignette on the sides, subtle wide-angle distortion. Lighting: Hard directed light from front slightly above, flash effect, deep but controlled shadows, bold night mood. Skin: Natural texture with visible pores, natural blush on cheeks, delicate subsurface scattering, light penetrating through skin for realistic glow. Hair and fabric: Detailed strands with individual stray hairs, cotton t-shirt with texture and ribbed collar, natural fabric folds, metallic silver accessories. Post-processing: Light HDR, cinematic neutral color grading, subtle film grain, soft cinematic retouching emphasizing natural skin texture and soft peach fuzz along jawline and cheeks, light wet shine on lips. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "midnight-steps-editorial",
    title: "Midnight Steps Editorial",
    description: "Gritty late-night flash portrait on concrete stairs",
    image: "/images/prompts/midnight-steps-editorial.jpg",
    category: "portrait",
    prompt: `Ultra-realistic night-time street portrait of a person lounging on rough concrete steps outside, framed with deep black sky above and only the stair structure visible. Wearing stylish night-out outfit with jacket. Sitting diagonally across the steps in a relaxed pose, shoulders relaxed, head tilted slightly forward looking at the viewer with a soft, unfocused gaze. The concrete stairs are stained and weathered, illuminated by a harsh single flash hitting directly, making skin and clothes pop against the dark background while casting strong shadows. Camera: Full-frame, 35mm lens, low angle, direct flash. Lighting: On-camera flash creating bright hotspot and hard-edged shadows, gritty late-night city mood with Y2K film-photography vibe. Skin: Visible pores, natural texture, fine imperfections. Post-processing: Slightly warm flash color, moderate contrast, subtle film grain, gentle vignette. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "winter-flash",
    title: "Winter Flash",
    description: "Intimate winter portrait with raw flash aesthetic",
    image: "/images/prompts/winter-flash.jpg",
    category: "portrait",
    prompt: `A cinematic indoor portrait of a person leaning slightly sideways against a plain light-colored wall. The pose is relaxed and natural, with a subtle curve in the body and a soft tilt of the head. Expression calm, distant, slightly dreamy, eyes looking toward the camera without tension. Outfit: minimal fitted top with clean lines, plush winter fur hat with thick texture framing the face. Lighting: direct on-camera flash creating a raw, early-2000s aesthetic, strong highlights on skin, soft shadow cast on the wall behind, slight overexposure typical of point-and-shoot flash photography. Environment: simple interior setting, neutral wall. Camera & style: analog-inspired flash photography, slight grain, imperfect exposure, casual editorial feel, candid mood. Mood: effortless, intimate, winter-night aesthetic. No mirror, no text, no exaggerated posing. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "pink-hoodie-editorial",
    title: "Pink Hoodie Editorial",
    description: "Bold color-blocked fashion portrait with Kodak flash",
    image: "/images/prompts/pink-hoodie-editorial.jpg",
    category: "portrait",
    prompt: `Ultra-realistic fashion photograph of a person against a bold green background, wearing a pink hoodie with sharply defined fabric texture and visible stitching detail. Gazing directly into the camera with intensity, head tilted slightly downward for a strong, commanding look. Shot from chest-up at eye level with a Kodak flash capturing crisp facial detail and fabric realism. Avoid AI artifacts, waxy or fake skin, blurred hoodie texture, flat lighting, CGI look, unrealistic shadows, cartoon-like colors. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "european-street-fashion",
    title: "European Street Fashion",
    description: "Cinematic street style portrait on European city street",
    image: "/images/prompts/european-street-fashion.jpg",
    category: "portrait",
    prompt: `A realistic full-body street fashion portrait of a stylish person walking confidently on an empty European city street. Wearing a stylish leather jacket, casual outfit underneath, polished shoes. Hands casually in pockets, natural features, neutral facial expression. Urban background with gray marble building facade, closed metal shutters, muted tones, minimal traffic. Soft natural daylight, overcast sky, cinematic mood. Shot on a 35mm lens, eye-level angle, shallow depth of field, ultra-realistic textures, editorial fashion photography style, modern, minimal, high-end aesthetic. Keep the subject's exact facial features from the reference photo.`,
  },

  // Filters
  {
    id: "3d-pastel-avatar",
    title: "3D Pastel Avatar",
    description: "Polished 3D character in soft pastel style",
    image: "/images/prompts/3d-pastel-avatar.jpg",
    category: "filters",
    prompt: `Create a highly polished 3D character portrait in a soft pastel, toy-like style. Smooth surfaces, gentle lighting, and clean gradients. Avatar should have expressive eyes, stylized hair, soft shadows, and friendly, anime-inspired facial structure. Rendered in high-quality CGI with subtle ambient glow. Keep the subject's recognizable features.`,
  },
  {
    id: "caricature-portrait",
    title: "Caricature Portrait",
    description: "Hyperrealistic caricature with exaggerated features",
    image: "/images/prompts/caricature-portrait.jpg",
    category: "filters",
    prompt: `Hyperrealistic caricature style portrait with soft studio lighting, serious dramatic mood. Exaggerated facial proportions, large exaggerated cheeks and chin, deep expression lines. Formal attire, plain dark gradient background. Maintain recognizable facial features from reference.`,
  },
  {
    id: "chibi-avatar",
    title: "Chibi Avatar",
    description: "Cute Q-version doll style avatar",
    image: "/images/prompts/chibi-avatar.jpg",
    category: "filters",
    prompt: `Generate a Q-version chibi doll that wears the same clothes and looks the same as the reference! Perfectly supports locking the face and clothes. Cute miniature proportions with oversized head and expressive eyes.`,
  },
  {
    id: "2005-digicam",
    title: "2005 Digicam",
    description: "Early digital camera mall aesthetic",
    image: "/images/prompts/2005-digicam.jpg",
    category: "filters",
    prompt: `Low-resolution digital photo aesthetic from 2005. Harsh on-camera flash, blown-out highlights, digital noise, waxy skin texture, orange date stamp in corner, early digital camera look. Mall or indoor setting with friends, Myspace-era aesthetic. Keep the subject's facial features.`,
  },
  {
    id: "y2k-arcade",
    title: "Y2K Arcade",
    description: "Y2K grunge cool aesthetic arcade portrait",
    image: "/images/prompts/y2k-arcade.jpg",
    category: "filters",
    prompt: `Y2K grunge aesthetic portrait as selfie in arcade. Styled hair, star stickers near eyes optional, casual Y2K outfit, arcade environment with flashing screens and neon lighting. Keep the subject's facial features.`,
  },
  {
    id: "tumblr-2013",
    title: "Tumblr 2013",
    description: "Indie sleaze revival bedroom aesthetic",
    image: "/images/prompts/tumblr-2013.jpg",
    category: "filters",
    prompt: `2013 Tumblr bedroom aesthetic with identity preservation. Messy teen bedroom floor with fairy lights tangled, scattered Polaroids and soda cans, subject laying on stomach on carpet, striped thrift shirt and plaid or cargo pants, warm fairy lights plus phone flash lighting. Keep the subject's facial features.`,
  },
  {
    id: "polaroid-moment",
    title: "Polaroid Moment",
    description: "Vintage Polaroid style with soft flash blur",
    image: "/images/prompts/polaroid-moment.jpg",
    category: "filters",
    prompt: `Take a photo taken with a Polaroid camera. The photo should look like an ordinary photograph. The photo should have a slight blur and a consistent light source, like a flash from a dark room, scattered throughout the photo. Don't change the faces. Keep the subject's facial features.`,
  },
  {
    id: "bts-mad-max",
    title: "BTS: Mad Max",
    description: "Behind-the-scenes selfie on post-apocalyptic movie set",
    image: "/images/prompts/bts-mad-max.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a post-apocalyptic desert movie set. Person taking a direct selfie with the camera, subtle confident expression. Post-apocalyptic wasteland environment with vast desert, sand, dust storms, custom war vehicles, spiked cars, muscle cars, chains, metal scraps, rugged props, burnt textures visible in background. Harsh sunlight mixed with cinematic contrast lighting, dust in the air, professional film crew and cameras visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing rugged desert-worn clothing. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with warm orange, dusty brown and teal tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-game-of-thrones",
    title: "BTS: Game of Thrones",
    description: "Behind-the-scenes selfie on medieval fantasy set",
    image: "/images/prompts/bts-game-of-thrones.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a medieval fantasy TV series set. Person taking a direct selfie with the camera, subtle confident expression. Epic castle environment with stone walls, throne room, torches, medieval banners, swords, armor props, dragon egg replicas visible in background. Dramatic diffused lighting mixed with practical torch light, fog machines creating atmosphere, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing medieval-inspired costume with leather and fur details. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with cold blue, grey stone and warm firelight tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-stranger-things",
    title: "BTS: Stranger Things",
    description: "Behind-the-scenes selfie on 80s supernatural horror set",
    image: "/images/prompts/bts-stranger-things.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on an 80s supernatural horror TV series set. Person taking a direct selfie with the camera, subtle confident expression. Retro 1980s environment with arcade machines, vintage bikes, Christmas lights, Upside Down portal props with vines and fog, retro wood-paneled walls visible in background. Moody lighting with red and blue gels, fog machines, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing vintage 80s clothing with denim jacket. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with warm nostalgic amber, cool blue and eerie red tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-breaking-bad",
    title: "BTS: Breaking Bad",
    description: "Behind-the-scenes selfie on desert crime drama set",
    image: "/images/prompts/bts-breaking-bad.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a desert crime drama TV series set. Person taking a direct selfie with the camera, subtle confident expression. New Mexico desert environment with RV camper van, chemical lab equipment props, barrels, industrial warehouse setting, dusty terrain visible in background. Harsh desert sunlight with dramatic shadows, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing yellow hazmat suit or casual desert-appropriate clothing. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with warm yellow desert tones, harsh contrast and desaturated earth colors. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-star-wars",
    title: "BTS: Star Wars",
    description: "Behind-the-scenes selfie on space opera movie set",
    image: "/images/prompts/bts-star-wars.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a space opera movie set. Person taking a direct selfie with the camera, subtle confident expression. Spaceship interior environment with metal corridors, control panels with blinking lights, hologram projector props, droid robots, lightsaber props visible in background. Dramatic practical lighting with blue and orange gels, fog for atmosphere, professional film crew and green screens visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing futuristic space pilot costume. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with cool steel blue, warm amber and deep space black tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-walking-dead",
    title: "BTS: Walking Dead",
    description: "Behind-the-scenes selfie on zombie apocalypse set",
    image: "/images/prompts/bts-walking-dead.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a zombie apocalypse TV series set. Person taking a direct selfie with the camera, subtle confident expression. Post-apocalyptic environment with abandoned buildings, overturned cars, chain-link fences, zombie extras in makeup, fake blood props, weapons visible in background. Gritty natural lighting with overcast sky, professional film crew and makeup artists visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing rugged survivor clothing with leather vest. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with desaturated greens, muted earth tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-squid-game",
    title: "BTS: Squid Game",
    description: "Behind-the-scenes selfie on Korean survival game set",
    image: "/images/prompts/bts-squid-game.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a Korean survival game TV series set. Person taking a direct selfie with the camera, subtle confident expression. Colorful game arena environment with geometric shapes, giant doll prop, pastel pink and mint green staircases, masked guards in pink jumpsuits visible in background. Dramatic studio lighting with stark contrasts, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing green numbered tracksuit contestant costume. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with vibrant pink, mint green tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-wednesday",
    title: "BTS: Wednesday",
    description: "Behind-the-scenes selfie on gothic academy set",
    image: "/images/prompts/bts-wednesday.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a gothic academy TV series set. Person taking a direct selfie with the camera, subtle confident expression. Dark academia environment with gothic stone architecture, stained glass windows, candelabras, vintage furniture, mysterious portraits, cobwebs visible in background. Moody dramatic lighting with cool blue and purple tones, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing dark preppy school uniform with blazer. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with desaturated cool tones, deep shadows. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-peaky-blinders",
    title: "BTS: Peaky Blinders",
    description: "Behind-the-scenes selfie on 1920s gangster set",
    image: "/images/prompts/bts-peaky-blinders.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a 1920s British gangster TV series set. Person taking a direct selfie with the camera, subtle confident expression. Industrial Birmingham environment with cobblestone streets, brick factories, vintage cars, pub interior, gas lamps, fog for smoky atmosphere visible in background. Dramatic moody lighting with golden tungsten and cold shadows, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing 1920s three-piece tweed suit with peaked cap. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with desaturated sepia, warm amber highlights. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-blade-runner",
    title: "BTS: Blade Runner",
    description: "Behind-the-scenes selfie on cyberpunk noir set",
    image: "/images/prompts/bts-blade-runner.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a cyberpunk noir movie set. Person taking a direct selfie with the camera, subtle confident expression. Dystopian futuristic city environment with neon signs, rain effects, holographic billboard screens, wet streets reflecting lights, steam vents visible in background. Dramatic noir lighting with neon pink and cyan gels, rain machines, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing futuristic noir trench coat with high collar. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with neon pink, electric blue tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-money-heist",
    title: "BTS: Money Heist",
    description: "Behind-the-scenes selfie on Spanish heist drama set",
    image: "/images/prompts/bts-money-heist.jpg",
    category: "filters",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a Spanish heist drama TV series set. Person taking a direct selfie with the camera, subtle confident expression. Bank vault environment with gold bars props, money printing machines, Salvador Dali masks on tables, red jumpsuit costumes visible in background. Dramatic studio lighting with warm Spanish golden tones, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing iconic red jumpsuit heist costume. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with rich red, warm gold tones. Keep the subject's exact facial features from the reference photo.`,
  },

  // Enhanced
  {
    id: "underwater-macro",
    title: "Underwater Macro",
    description: "Surreal half-submerged face portrait",
    image: "/images/prompts/underwater-macro.jpg",
    category: "enhanced",
    prompt: `Hyper-realistic, ultra-detailed close-up portrait showing only half of face submerged in water, one eye in sharp focus, light rays creating caustic patterns on skin, suspended water droplets and bubbles adding depth, cinematic lighting with soft shadows and sharp highlights, photorealistic textures including skin pores, wet lips, eyelashes, and subtle subsurface scattering, surreal and dreamlike atmosphere, shallow depth of field, underwater macro perspective. Keep the subject's facial features.`,
  },
  {
    id: "ethereal-sunlight",
    title: "Ethereal Sunlight",
    description: "Dreamy golden hour glow with soft sunbeams",
    image: "/images/prompts/ethereal-sunlight.jpg",
    category: "enhanced",
    prompt: `Apply an ethereal lighting filter to the uploaded photo while fully preserving every original detail of the photo unchanged except for lighting, glow, and color mood. Add diffused sunbeams striking the subject's skin, creating a glowing highlight on cheekbones, nose bridge, lips, and hair strands. Maintain clear separation between bright sunlit areas and soft, deep shadows to create a cinematic high-contrast mood. Inject subtle lens bloom, light haze, and a thin layer of atmospheric glow around the face and shoulders. Render skin with luminous translucency and gentle peachy tones. Enhance stray hair strands backlit by sunlight. Color-grade with slightly lowered saturation, and gentle film-like grain. Keep the overall background intact but allow sunlight flares and soft bokeh to wrap naturally around the subject. The result should look like a soft, ethereal daydream-sunlit, delicate, and cinematic. Hard rule: Do not change the face and hair of the subject.`,
  },
  {
    id: "cinematic-upgrade",
    title: "Cinematic Upgrade",
    description: "Premium full-frame camera quality enhancement",
    image: "/images/prompts/cinematic-upgrade.jpg",
    category: "enhanced",
    prompt: `Enhance the original photo while keeping the pose, background, face, clothing, and framing exactly the same. Transform ONLY the lighting, atmosphere, and camera quality: LIGHT + ATMOSPHERE: create a dreamy cinematic golden backlight or side-light depending on the natural light direction of the scene, add subtle atmospheric haze ONLY around the light source so the light glows but keep the overall scene clear, apply soft highlight bloom blur on bright areas (cheeks, shoulders, hair edges) without reducing detail, add clean halation glow that melts only the light edges into the background not the subject, introduce a gentle diffused ambience avoiding any heavy fog or smoke, soften transitions between light and shadow for a smooth creamy cinematic look, add controlled volumetric light rays with softly blurred edges, blur ONLY the light glow not the subject or scene. CAMERA QUALITY UPGRADE: enhance clarity, texture, and micro-contrast to match a Sony A1 / Canon R5 full-frame camera, improve dynamic range so highlights and shadows retain detail, reduce noise and artifacts for a clean high-end professional look, add rich cinematic color depth and natural skin tones, increase lens sharpness while keeping the dreamy lighting intact, simulate high-end glass with subtle lens bloom and smooth bokeh depth. Do NOT change: pose, background, facial structure, hair shape, clothes, proportions. Only enhance lighting, glow, atmosphere, and upgrade overall camera quality to a premium cinematic full-frame look.`,
  },
  {
    id: "matrix-cyberpunk",
    title: "Matrix Cyberpunk",
    description: "Cyberpunk portrait with binary code reflections",
    image: "/images/prompts/matrix-cyberpunk.jpg",
    category: "enhanced",
    prompt: `A close-up portrait of a person with wet skin and droplets on their face, wearing sunglasses that reflect streams of glowing green binary code. The atmosphere is futuristic and cyberpunk, inspired by The Matrix. The lighting is moody and dramatic, with neon green highlights and deep shadows. The person's expression is intense and focused, suggesting intelligence and determination. The background features cascading lines of digital code, softly blurred to enhance depth. Realistic cinematic lighting, ultra-detailed textures, high contrast, and glossy reflections. Keep the subject's exact facial features.`,
  },
  {
    id: "chrome-grillz-portrait",
    title: "Chrome Grillz Portrait",
    description: "Luxury custom chrome dental grillz editorial",
    image: "/images/prompts/chrome-grillz-portrait.jpg",
    category: "enhanced",
    prompt: `Edit the image to add custom chrome dental grillz on the upper teeth. The grillz should feature clean geometry with extruded metal lettering and a polished mirror chrome finish. The chrome grillz should cover only the visible front half of the upper teeth, not the full tooth surface. Style should match luxury hip-hop jewelry with realistic metal finish, sharp edges, and accurate reflections. Preserve the exact face, lips, skin texture, mouth shape, angle, lighting, and background from the reference. Do not change anything except adding the upper grillz. Ultra-realistic, high-detail jewelry craftsmanship, realistic reflections matching the scene lighting, luxury fashion editorial look. Keep the subject's exact facial features from the reference photo.`,
  },

  // Product - Amazon Main Image (White Seamless)
  {
    id: "product-mirror-selfie",
    title: "Product Selfie",
    description: "Realistic mirror selfie holding a product",
    image: "/images/prompts/product-mirror-selfie.jpg",
    category: "product",
    prompt: `Create a hyper-realistic mirror selfie of a person holding the product in one hand. Use natural bathroom lighting with a believable handheld phone reflection in the mirror. Keep the subject's exact facial features.`,
  },
  {
    id: "amazon-packshot",
    title: "Amazon Packshot",
    description: "Clean white background product shot",
    image: "/images/prompts/amazon-packshot.jpg",
    category: "product",
    prompt: `Ultra-realistic studio photograph of the product on a pure white seamless background, centered, fills ~85–90% of frame, 85mm prime look, f/8 sharpness, ISO 100, softbox high-key lighting, gentle contact shadow under product, natural colors, no props, no text, no logos, no watermark.`,
  },
  {
    id: "footwear-packshot",
    title: "Footwear Shot",
    description: "Single shoe 3/4 angle on white",
    image: "/images/prompts/footwear-packshot.jpg",
    category: "product",
    prompt: `Photorealistic packshot of the product at a 3/4 angle on white seamless, high-key diffused light, crisp edge detail, subtle ground shadow, product centered and fills ~85–90%, no extras.`,
  },
  {
    id: "apparel-flatlay",
    title: "Apparel Flat Lay",
    description: "Neatly folded garment on white",
    image: "/images/prompts/apparel-flatlay.jpg",
    category: "product",
    prompt: `Realistic flat-lay of the product on a pure white background, high-key light tent softness, accurate texture, crease minimized, centered, fills ~85%, no tags or props.`,
  },
  {
    id: "beauty-bottle",
    title: "Beauty Bottle",
    description: "Pump/dropper bottle studio shot",
    image: "/images/prompts/beauty-bottle.jpg",
    category: "product",
    prompt: `Studio packshot of the product on white seamless, large diffused softbox overhead + front fill, controlled specular highlights, readable label, no glare, natural color, centered, fills ~85–90%, no text overlay or props.`,
  },
  {
    id: "skincare-jar",
    title: "Skincare Jar",
    description: "Cream jar with lid clarity",
    image: "/images/prompts/skincare-jar.jpg",
    category: "product",
    prompt: `Photorealistic packshot of the product on white seamless, soft even lighting, micro-contrast for embossed details, gentle contact shadow, centered, fills ~85–90%, no surrounding props.`,
  },
  {
    id: "retail-box",
    title: "Retail Box",
    description: "Front-facing product box shot",
    image: "/images/prompts/retail-box.jpg",
    category: "product",
    prompt: `Front-facing product on a pure white background, high-key studio light free of edge spill, straightened perspective, sharp detail, no added graphics, centered, fills ~85–90%.`,
  },
  {
    id: "ceramic-mug",
    title: "Ceramic Mug",
    description: "Clean mug with ceramic gloss",
    image: "/images/prompts/ceramic-mug.jpg",
    category: "product",
    prompt: `Photorealistic product on white seamless, clean edges, accurate surface finish with soft speculars, subtle contact shadow, centered, fills ~85–90%, no props.`,
  },
  {
    id: "backpack-packshot",
    title: "Backpack Shot",
    description: "Standing backpack front view",
    image: "/images/prompts/backpack-packshot.jpg",
    category: "product",
    prompt: `Realistic studio photo of the product standing upright on white seamless, high-key light tent, even illumination, visible details, straight-on, centered, fills ~85–90%, no props.`,
  },
  {
    id: "steel-bottle",
    title: "Steel Bottle",
    description: "Stainless steel with controlled reflections",
    image: "/images/prompts/steel-bottle.jpg",
    category: "product",
    prompt: `Packshot of the product on pure white, large diffused softbox to minimize harsh reflections, controlled gradient on surfaces, subtle ground shadow, centered, fills ~85–90%, no props.`,
  },
  {
    id: "toy-figurine",
    title: "Toy Figurine",
    description: "Single figurine crisp detail",
    image: "/images/prompts/toy-figurine.jpg",
    category: "product",
    prompt: `Photorealistic product on white seamless, high-key, crisp edge detail, accurate color, gentle contact shadow, centered, fills ~85–90%, no props or effects.`,
  },

  // Product - Lifestyle / Secondary Images
  {
    id: "headphones-desk",
    title: "Headphones Desk",
    description: "Minimalist desk lifestyle shot",
    image: "/images/prompts/headphones-desk.jpg",
    category: "product",
    prompt: `Realistic lifestyle image: the product resting on a minimalist desk setup with soft window light, neutral palette, shallow depth, gentle natural shadow, no brand logos beyond the product, clean composition.`,
  },
  {
    id: "shoe-pavement",
    title: "Shoe on Pavement",
    description: "Sunlit street action suggestion",
    image: "/images/prompts/shoe-pavement.jpg",
    category: "product",
    prompt: `Photoreal product placed on sunlit pavement with soft directional light, slight motion suggestion via shadow angle, no person visible, neutral background blur, true color.`,
  },
  {
    id: "skincare-bathroom",
    title: "Skincare Bathroom",
    description: "Beauty bottle on bathroom tile",
    image: "/images/prompts/skincare-bathroom.jpg",
    category: "product",
    prompt: `Realistic scene: product on matte bathroom tile, soft backlight + fill, tiny water droplets on surface, color-true label, clean reflections.`,
  },
  {
    id: "coffee-mug-kitchen",
    title: "Coffee Mug Kitchen",
    description: "Morning light countertop scene",
    image: "/images/prompts/coffee-mug-kitchen.jpg",
    category: "product",
    prompt: `Lifestyle: product on light wood countertop, soft morning light, neutral kitchen background, subtle depth of field.`,
  },
  {
    id: "backpack-hook",
    title: "Backpack Hook",
    description: "Hanging backpack lifestyle shot",
    image: "/images/prompts/backpack-hook.jpg",
    category: "product",
    prompt: `Realistic scene: product hanging on a chair or wall hook, soft ambient light, visible texture and details, neutral wall backdrop.`,
  },
  {
    id: "knife-cutting-board",
    title: "Chef Knife Board",
    description: "Knife on cutting board scene",
    image: "/images/prompts/knife-cutting-board.jpg",
    category: "product",
    prompt: `Photoreal close scene: product on wooden cutting board with clean produce slices, side light to show detail, controlled reflections.`,
  },
  {
    id: "yoga-mat-studio",
    title: "Yoga Mat Studio",
    description: "Rolled mat serene wellness shot",
    image: "/images/prompts/yoga-mat-studio.jpg",
    category: "product",
    prompt: `Lifestyle: product on studio floor, soft side lighting, subtle floor texture, clean and serene.`,
  },
  {
    id: "watch-wrist",
    title: "Watch on Wrist",
    description: "Close wrist shot no face",
    image: "/images/prompts/watch-wrist.jpg",
    category: "product",
    prompt: `Close, realistic shot of the product worn on a wrist, neutral skin tone, soft diffused light, no face shown, background blur, color-accurate details.`,
  },
  {
    id: "sunglasses-towel",
    title: "Sunglasses Beach",
    description: "Beach towel lifestyle shot",
    image: "/images/prompts/sunglasses-towel.jpg",
    category: "product",
    prompt: `Photoreal scene: product on a textured beach towel, soft sunlight and gentle shadow, accurate colors, uncluttered composition.`,
  },
  {
    id: "bottle-fridge",
    title: "Bottle in Fridge",
    description: "Cool fridge door context shot",
    image: "/images/prompts/bottle-fridge.jpg",
    category: "product",
    prompt: `Realistic image: product standing in a fridge door shelf, cool backlight, condensation beads, clean surroundings.`,
  },

  // Product - Specialty / Challenging
  {
    id: "jewelry-diffusion",
    title: "Jewelry Diffusion",
    description: "Gemstone with controlled highlights",
    image: "/images/prompts/jewelry-diffusion.jpg",
    category: "product",
    prompt: `Photoreal product packshot on pure white seamless, large diffusion tent lighting, controlled specular highlights, focus on fine details, minimal reflections, centered, fills ~85–90%, no props.`,
  },
  {
    id: "glass-bottle-backlit",
    title: "Glass Bottle Backlit",
    description: "Transparent glass with contours",
    image: "/images/prompts/glass-bottle-backlit.jpg",
    category: "product",
    prompt: `Ultra-realistic transparent product on white seamless with soft backlight to define contours, front fill to retain label legibility, controlled edge highlights, subtle ground shadow, centered, fills ~85–90%.`,
  },
  {
    id: "textile-macro",
    title: "Textile Macro",
    description: "Fabric weave detail shot",
    image: "/images/prompts/textile-macro.jpg",
    category: "product",
    prompt: `Macro shot of product texture on white background, soft raking light to show detail, high micro-contrast, color-accurate.`,
  },
  {
    id: "white-on-white",
    title: "White on White",
    description: "White product shadow separation",
    image: "/images/prompts/white-on-white.jpg",
    category: "product",
    prompt: `Photoreal light-colored product on pure white background, high-key lighting with slight angled key to create soft separation shadow, micro-contrast on edges, centered, fills ~85–90%, no props.`,
  },
  {
    id: "cosmetics-swatches",
    title: "Cosmetics Swatches",
    description: "True color makeup swatches",
    image: "/images/prompts/cosmetics-swatches.jpg",
    category: "product",
    prompt: `Realistic product swatches on a white card, soft diffused top light, neutral white balance, accurate hues, minimal shadow, clean edges.`,
  },
];

// Pre-computed indexes for O(1) lookups
const promptsById = new Map<string, Prompt>(
  prompts.map((p) => [p.id, p])
);

const promptsByCategory = new Map<PromptCategory, Prompt[]>();
promptsByCategory.set("all", prompts);
for (const prompt of prompts) {
  const existing = promptsByCategory.get(prompt.category) || [];
  existing.push(prompt);
  promptsByCategory.set(prompt.category, existing);
}

export function getPromptById(id: string): Prompt | undefined {
  return promptsById.get(id);
}

export function getPromptsByCategory(category: PromptCategory): Prompt[] {
  return promptsByCategory.get(category) || [];
}
