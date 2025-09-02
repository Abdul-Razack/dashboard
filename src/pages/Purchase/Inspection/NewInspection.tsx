import {
    HStack,
    Heading,
    Stack,
    Button
  } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { SlideIn } from '@/components/SlideIn';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import jsPDF from 'jspdf';


const PdfContent = () => {
      const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        paddingBottom: '10px',
      };
      
      const logoStyle: React.CSSProperties = {
        width: '250px',
        marginRight: '30px'
      };
      
      const headerTextStyle: React.CSSProperties = {
        margin: '5px 0'
      };
      
      const containerStyle: React.CSSProperties = {
        width: '800px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        fontWeight: 'bold',
      };
      
      const titleStyle: React.CSSProperties = {
        fontSize: '30px',
        textAlign: 'center',
        marginBottom: '20px',
        border: '2px solid',
        padding: '5px',
        backgroundColor: 'rgb(220, 220, 220)',
        fontWeight: 'bold',
      };

      const sectionStyle: React.CSSProperties = {
        // marginBottom: '20px',
        border: '2px solid #000',
        padding: '10px'
      };
      
      const sectionTitleStyle: React.CSSProperties = {
        backgroundColor: '#dcdcdc',
        padding: '5px',
        margin: '0'
      };
      
      const sectionContentStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px'
      };
      
      const halfWidthStyle: React.CSSProperties = {
        width: '48%'
      };
      
      const labelStyle: React.CSSProperties = {
        display: 'block',
        fontWeight: 'bold',
        marginTop: '10px'
      };
      
      const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        boxSizing: 'border-box'
      };
      
      const textAreaStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px',
        marginTop: '5px',
        boxSizing: 'border-box',
        height: '100px'
      };
      
      const signatureStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between'
      };
      
      const footerStyle: React.CSSProperties = {
        borderTop: '2px solid #000',
        paddingTop: '10px',
        display: 'flex',
        justifyContent: 'space-between'
      };
      
      const footerLogoStyle: React.CSSProperties = {
        width: '50px',
        margin: '5px'
      };
      
    return(
        <div style={containerStyle} id="pdf-content">
            <div style={headerStyle}>
            <img src="logo.png" alt="Logo" style={logoStyle} />
            <div style={headerTextStyle}>
                <p>YeS Technik FZC</p>
                <p>PO 122215, P3-06WH</p>
                <p>SAIF Zone,</p>
                <p>Sharjah, UAE</p>
                <p>Tel: +9714 6 552 8341</p>
            </div>
            </div>
            <h1 style={titleStyle}>Corrective / Preventive Action Form</h1>
            <form>
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>SECTION 1 GENERAL INFORMATION</h2>
                <div style={sectionContentStyle}>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>FROM:</label>
                        <input type="text" style={inputStyle} />
                        <label style={labelStyle}>TO:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>CAR/PAR NO:</label>
                        <input type="text" style={inputStyle} />
                        <label style={labelStyle}>DATE:</label>
                        <input type="text" style={inputStyle} />
                        <label style={labelStyle}>(TO BE FILLED BY MR)</label>
                        <input type="text" style={inputStyle} />
                    </div>
                </div>
            </div>
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>SECTION 2 (To Be Filled By Originator and issued to the Management Representative)</h2>
                <label style={labelStyle}>DESCRIPTION OF POTENTIAL PROBLEM</label>
                <textarea style={textAreaStyle}></textarea>
                <div style={signatureStyle}>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>Signature:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>Date:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                </div>
            </div>
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>SECTION 3 (To be filled by the MR/QC)</h2>
                <label style={labelStyle}>POSSIBLE EFFECTS DUE TO REPORTED PROBLEM / ROOT CAUSE</label>
                <textarea style={textAreaStyle}></textarea>
                <div style={signatureStyle}>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>Signature:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>Date:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                </div>
            </div>
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>SECTION 4</h2>
                <label style={labelStyle}>PROPOSED CORRECTIVE / PREVENTIVE ACTION ( To be decided by Dept. Head / MR / QC)</label>
                <textarea style={textAreaStyle}></textarea>
                <div style={signatureStyle}>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>ACTION BY:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>TARGET DATE:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                    <div style={halfWidthStyle}>
                        <label style={labelStyle}>Signature:</label>
                        <input type="text" style={inputStyle} />
                    </div>
                </div>
            </div>
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>SECTION 5 (To Be Completed By Responsible Person)</h2>
                <label style={labelStyle}>CORRECTIVE/PREVENTIVE ACTION COMPLETED</label>
                <div style={signatureStyle}>
                <input type="text" style={inputStyle} />
                <label style={labelStyle}>DATE:</label>
                <input type="text" style={inputStyle} />
                <label style={labelStyle}>SIGNATURE:</label>
                <input type="text" style={inputStyle} />
                </div>
            </div>
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>SECTION 6 (To Be Completed By Management Representative)</h2>
                <label style={labelStyle}>CORRECTIVE/PREVENTIVE ACTION VERIFIED</label>
                <div style={signatureStyle}>
                    <label style={labelStyle}>Signature:</label>
                    <input type="text" style={inputStyle} />
                    <label style={labelStyle}>DATE:</label>
                    <input type="text" style={inputStyle} />
                </div>
                <div style={signatureStyle}>
                    <label style={labelStyle}>IS PREVENTIVE ACTION REQUIRED:</label>
                    <input type="checkbox" name="preventive_action" value="yes" style={{marginTop: '10px'}}/> <label style={{marginTop: '8px'}}>Yes</label>
                    <input type="checkbox" name="preventive_action" value="no"  style={{marginTop: '10px'}}/> <label style={{marginTop: '8px'}}>No</label>
                    <p style={{marginTop: '8px'}}>(If yes please use the CAR/PAR form)</p>
                </div>
            </div>
            </form>
            <div style={{marginTop: '20px'}}>
                <div style={signatureStyle}>
                    <img src="asa-logo.png" alt="img" style={footerLogoStyle} />
                    <a href='www.yestechnik.com' target='_blank'>www.yestechnik.com</a>
                    <div style={{display: 'flex'}}>
                        <img src="asa-logo.png" alt="img" style={footerLogoStyle} />
                        <img src="asa-logo.png" alt="img" style={footerLogoStyle} />
                    </div>
                </div>
            </div>
            <div style={footerStyle}>
                <p>Issue 2 Revision 0.0</p>
                <p>MAR’2023</p>
                <p>QSP-Form 18</p>
                <p>Page 1 of 1</p>
            </div>
        </div>
    );    
};

const NewInspectionpage = () => {
    const navigate = useNavigate();
    
    const handleDownloadPDF = (): void => {
        const doc = new jsPDF({
            unit: 'pt',
            format: 'a4',
            orientation: 'portrait'
        });
        const pdfDocument = document.getElementById('pdf-content');
    
        if (pdfDocument) {
            doc.html(pdfDocument, {
                callback: (doc: jsPDF) => {
                    doc.save('Preventive_Action_Form.pdf');
                },
                x: 50,
                y: 10,
                html2canvas: { scale: 0.4 },
                margin: [10, 50, 10, 50],
                autoPaging: 'text',
                width: 595.28 - 20,
                windowWidth: 1024
            });
        }
    };

    return(
        <SlideIn>
            <Stack pl={2} spacing={4}>
                <HStack justify={'space-between'}>
                    <Heading as="h4" size={'md'}>INSPECTION</Heading>
                    <ResponsiveIconButton
                        variant={'@primary'}
                        icon={<LuPlus />}
                        size={'sm'}
                        fontWeight={'thin'}
                        onClick={() => navigate(`/inspection/create`)}
                    >
                        Create
                    </ResponsiveIconButton>
                </HStack>
            </Stack>
            <Stack pl={2} spacing={4}>
                <HStack justify={'space-between'}>
                   <PdfContent />
                </HStack>
            </Stack>
            <Stack pl={2} spacing={4}>
                <HStack justify={'center'}>
                    <Button
                        colorScheme="brand"
                        size={'sm'}
                        px={4}
                        mt={7}
                        width='200px'
                        onClick={handleDownloadPDF}
                    >
                        Download PDF
                    </Button>
                </HStack>
            </Stack>
            
                    
        </SlideIn>   
    );
};

export default NewInspectionpage;