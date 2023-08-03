import dynamic from "next/dynamic";

const QuillNoSSRWrapper = dynamic(import("react-quill"), { ssr: false });

export default QuillNoSSRWrapper;
