import { useState } from 'react';

type FooterProps = {
  source: string;
  target: string;
};

const Footer: React.FC<FooterProps> = ({ source, target }) => {
  const languageISO639: string[] = [
    'en',
    'fr',
    'da',
    'de',
    'ht',
    'haw',
    'it',
    'sw',
    'vi',
    'yo',
    'zh',
    'zu',
  ];
  const [language, setLanguage] = useState<string>(target);

  const handleSelectChange = (value: string) => {
    setLanguage(value);
  };

  return (
    <div className='mt-1'>
      <hr />
      <div className='flex justify-between mb-1'>
        <p className='ignore'>Source Language: {source.toUpperCase()} </p>
        <label htmlFor='target_lang'>
          Target Language:
          <select
            className='target_lang'
            id='target_lang'
            onChange={(e) => handleSelectChange(e.target.value)}
            value={language}
            required
          >
            {languageISO639.map((lang, index) => (
              <option key={index} value={lang} disabled={lang === source}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className='mt-1 mb-1 rounded'>Translate</button>
      <p>
        <a className='text-red-500'>Read the docs</a> to learn more about Ithi.
      </p>
    </div>
  );
};

export default Footer;
