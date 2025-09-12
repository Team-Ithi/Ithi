type HeaderProps = {
  fileName: string;
};

const Header: React.FC<HeaderProps> = ({ fileName }) => {
  return (
    <div>
      <h1>{fileName}</h1>
      <hr />
    </div>
  );
};

export default Header;
