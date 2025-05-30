// components/EmotionButton.jsx
import styled from 'styled-components';

const Button = styled.button`
  background-color: #0070f3;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0059c1;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default function EmotionButton({ children }) {
  return <Button>{children}</Button>;
}