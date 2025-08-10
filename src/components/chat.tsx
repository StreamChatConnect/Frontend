"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { useSocket } from "@/lib/useSocket";
import { AnimatePresence, motion } from "motion/react";
import { AuroraText } from "@/components/magicui/aurora-text";
import { EmojiRun, TextRun } from "@/shared-lib/types";
import { v4 as uuidv4 } from "uuid";

function isEmojiRun(run: EmojiRun | TextRun): run is EmojiRun {
  return "emoji" in run && run.emoji !== undefined;
}

function twitchEmoji(id: number) {
  return `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`;
}

export default function Chat({ limit }: { limit: number | false }) {
  const { socket, connected, streamMessages } = useSocket();

  useEffect(() => {
    if (!connected) return;
    socket?.emit("sync");
  }, [connected]);

  const sortedMessages = [...streamMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const messages =
    typeof limit === "number" ? sortedMessages.slice(-limit) : sortedMessages;

  return (
    <div className="space-y-2 flex flex-col">
      <AnimatePresence>
        {messages.map((msg) => {
          const { id, source, user, message, extra } = msg;

          const place = {
            "1ST": "tabler:laurel-wreath-1",
            "2ND": "tabler:laurel-wreath-2",
            "3RD": "tabler:laurel-wreath-3",
          };

          let sourceIcon = null;
          let sourceStr = null;

          switch (source) {
            case "SYSTEM":
              sourceIcon = (
                <Icon icon="tabler:shield-lock" width="1.4em" height="1.4em" />
              );
              sourceStr = "system";
              break;
            case "TW":
              sourceIcon = (
                <Icon icon="tabler:brand-twitch" width="1.4em" height="1.4em" />
              );
              sourceStr = "twitch";
              break;
            case "YT":
              sourceIcon = (
                <Icon
                  icon="tabler:brand-youtube"
                  width="1.4em"
                  height="1.4em"
                />
              );
              sourceStr = "youtube";
              break;
          }

          return (
            <motion.div
              key={id}
              layout
              className={`font-mono p-2 border rounded inline-flex gap-1 w-fit relative overflow-hidden before:inset-0 before:bg-background before:absolute before:z-[-1]`}
              style={{
                color: `var(--${sourceStr}-400)`,
                borderColor: `var(--${sourceStr}-400)`,
              }}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              transition={{
                ease: "anticipate",
                duration: 1,
              }}
            >
              <div
                className="absolute inset-0 z-[-1]"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--${sourceStr}-400) 20%, transparent)`,
                }}
              />

              <div className={"inline-flex gap-1"}>
                {source == "SYSTEM" ? (
                  sourceIcon
                ) : (
                  <div className={"inline-flex gap-1"}>
                    {sourceIcon}
                    {user.isMod && !user.isStreamer && (
                      <Icon
                        icon={"tabler:user-shield"}
                        width="1.4em"
                        height="1.4em"
                      />
                    )}
                    {source != "TW" && user.isStreamer && (
                      <Icon
                        icon={"tabler:device-computer-camera"}
                        width="1.4em"
                        height="1.4em"
                      />
                    )}
                    {user.place && (
                      <Icon
                        icon={place[user.place as "1ST" | "2ND" | "3RD"]}
                        width="1.4em"
                        height="1.4em"
                      />
                    )}
                    {source == "TW" &&
                      extra.badges &&
                      extra.badges.map((badge: any) => {
                        return (
                          <img
                            key={`${badge.set_id}-${badge.id}-${uuidv4()}`}
                            src={badge.data.image_url_1x}
                            alt={badge.data.title}
                            className="inline size-[1.4em] align-text-bottom"
                          />
                        );
                      })}
                  </div>
                )}

                {user.place || source == "SYSTEM" ? (
                  <AuroraText
                    key={id}
                    colors={[
                      `var(--${sourceStr}-400)`,
                      `var(--${sourceStr}-500)`,
                      `var(--${sourceStr}-600)`,
                      `var(--${sourceStr}-700)`,
                    ]}
                    speed={2}
                  >
                    <strong>{user.username}:</strong>
                  </AuroraText>
                ) : (
                  <strong>{user.username}:</strong>
                )}
              </div>

              {source == "TW" && (
                <div className="wrap-anywhere inline space-x-1">
                  {extra?.fragments.map((fragment: any, index: number) => {
                    const baseKey = `${msg.id}-${index}`;

                    switch (fragment.type) {
                      case "text": {
                        return (
                          <span key={`${baseKey}-text`}>{fragment.text}</span>
                        );
                      }
                      case "emote": {
                        return (
                          <img
                            key={`${baseKey}-${uuidv4()}`}
                            src={twitchEmoji(fragment.emote.id)}
                            alt={fragment.text}
                            className="inline size-[1.4em] align-text-bottom"
                          />
                        );
                      }
                      case "cheermote": {
                        return fragment.cheermoteData ? (
                          <div
                            key={`${baseKey}-${uuidv4()}`}
                            className={"inline"}
                          >
                            <img
                              src={
                                (fragment.cheermoteData.images.dark.animated ??
                                  fragment.cheermoteData.images.dark.static)[1]
                              }
                              alt={fragment.cheermote.bits}
                              className="inline size-[1.4em] align-text-bottom"
                            />
                            <AuroraText
                              colors={[
                                fragment.cheermoteData.color,
                                lightenHexColor(
                                  fragment.cheermoteData.color,
                                  0.2,
                                ),
                                darkenHexColor(
                                  fragment.cheermoteData.color,
                                  0.2,
                                ),
                              ]}
                            >
                              <span>{fragment.cheermote.bits}</span>
                            </AuroraText>
                          </div>
                        ) : null;
                      }
                    }
                  })}
                </div>
              )}

              {source == "YT" && (
                <p className="wrap-anywhere">
                  {extra?.runs.map((run: EmojiRun | TextRun, index: number) => {
                    const baseKey = `${msg.id}-${index}`;

                    if (isEmojiRun(run)) {
                      return (
                        <img
                          key={`${baseKey}-${run.emoji.emoji_id}`}
                          src={run.emoji.image?.[0]?.url}
                          alt={run.text}
                          className="inline size-[1em] align-text-bottom"
                        />
                      );
                    } else {
                      return <span key={`${baseKey}-text`}>{run.text}</span>;
                    }
                  })}
                </p>
              )}

              {source == "SYSTEM" && (
                <AuroraText
                  key={id}
                  colors={[
                    `var(--${sourceStr}-400)`,
                    `var(--${sourceStr}-500)`,
                    `var(--${sourceStr}-600)`,
                    `var(--${sourceStr}-700)`,
                  ]}
                  speed={2}
                >
                  <strong>{message}</strong>
                </AuroraText>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function lightenHexColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + 255 * percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + 255 * percent);
  const b = Math.min(255, (num & 0xff) + 255 * percent);
  return (
    "#" +
    ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
      .toString(16)
      .slice(1)
  );
}

function darkenHexColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - 255 * percent);
  const g = Math.max(0, ((num >> 8) & 0xff) - 255 * percent);
  const b = Math.max(0, (num & 0xff) - 255 * percent);
  return (
    "#" +
    ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
      .toString(16)
      .slice(1)
  );
}
