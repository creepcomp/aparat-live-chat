export const isArabicOrHebrew = (text) => {
  const arabicRegex = /[\u0600-\u06FF]/;
  const hebrewRegex = /[\u0590-\u05FF]/;
  return arabicRegex.test(text) || hebrewRegex.test(text);
};

export const getNicknameColor = (username = "") => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#B71C1C", // dark red
    "#880E4F", // dark pink
    "#4A148C", // dark purple
    "#311B92", // indigo
    "#1A237E", // dark blue
    "#0D47A1", // deep blue
    "#01579B", // teal-ish
    "#006064", // dark cyan
    "#004D40", // dark green
    "#1B5E20", // forest green
    "#33691E", // olive green
    "#F57F17", // dark yellow
    "#FF6F00", // amber dark
    "#E65100", // deep orange
    "#3E2723", // brown
    "#263238", // blue grey
  ];

  return colors[Math.abs(hash) % colors.length];
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
