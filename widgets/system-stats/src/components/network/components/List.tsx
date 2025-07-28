import { CopyToClipboard } from '@/components/common/CopyToClipboard';

type Props = {
  ips: any[];
};

export default function List({ ips }: Props) {
  return (
    <>
      {ips.length > 0 ? (
        ips.map((ip) => (
          <CopyToClipboard
            textToCopy={ip}
            key={ip}
            className="break-all whitespace-normal"
          >
            {ip}
          </CopyToClipboard>
        ))
      ) : (
        <p>N/A</p>
      )}
    </>
  );
}
