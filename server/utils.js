
export const formatTweet = ({ id_str, user, text, created_at }) => ({
  id_str,
  profile_image_url: user.profile_image_url,
  name: user.name,
  screen_name: user.screen_name,
  text,
  created_at,
});
