import Clipboard from '@react-native-clipboard/clipboard';

export const copy = (text: string) => {
  Clipboard.setString(text);
}