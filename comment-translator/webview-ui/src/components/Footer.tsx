type FooterProps = {
  source: string;
  target: string;
};

const Footer: React.FC<FooterProps> = ({ source, target }) => {
  return (
    <div className='mt-1'>
      <hr />
      <div className='flex justify-between mb-3 mt-3'>
        <p className='ignore'>Source Language: {source.toUpperCase()} </p>
        <p>Target Language: {target.toUpperCase()} </p>
      </div>
    </div>
  );
};

export default Footer;
