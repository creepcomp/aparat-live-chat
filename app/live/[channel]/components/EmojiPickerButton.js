import { useState } from "react";
import { IconButton, Box, ClickAwayListener } from "@mui/material";
import Picker from "@emoji-mart/react";

export default function EmojiPickerButton({ onSelectEmoji }) {
  const [open, setOpen] = useState(false);

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box position="relative" display="inline-block">
        <IconButton onClick={() => setOpen((prev) => !prev)}>😊</IconButton>
        {open && (
          <Box position="absolute" bottom="50px" right={0} zIndex={1000}>
            <Picker
              onEmojiSelect={(emoji) => onSelectEmoji(emoji.native)}
              theme="dark"
            />
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}
